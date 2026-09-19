'use strict';
const fs=require('node:fs'),path=require('node:path');
const {createProvider,safeId,sha256,writeNew,localInput}=require('../generation/providers/index.cjs');
const {loadCreative,tracking,preflight}=require('./creative.cjs');
const {normalize,qa,run,probe,exportSilent}=require('./qa.cjs');
const {transition,qaPassed,preparePublishDraft}=require('./workflow.cjs');
const ROOT=path.resolve(__dirname,'..');
function read(file){return JSON.parse(fs.readFileSync(file,'utf8'));}
function prepare(id){
  const c=loadCreative(id,ROOT);
  if(c.state!=='GENERATION_READY')throw Error('Creative not generation-ready');
  const provider=createProvider(c.generation_provider,path.join(ROOT,'generation/jobs'));
  return c.shots.map(s=>provider.generateVideo({creative_id:c.creative_id,shot_id:s.shot_id,prompt:s.prompt,reference_assets:c.reference_assets}));
}
function finish(id,ingestionFile,version){
  const original=loadCreative(id,ROOT),c={...original,edit_version:Number(version)};
  if(!Number.isInteger(c.edit_version)||c.edit_version<original.edit_version)throw Error('Use a new positive edit version');
  const input=read(ingestionFile);
  if(input.creative_id!==id||!Array.isArray(input.shots)||input.shots.length!==c.shots.length)throw Error('Ingestion creative/shot count mismatch');
  // Validate everything before creating output directories. Never fetch an arbitrary media URL.
  for(const s of c.shots){
    const matches=input.shots.filter(x=>x.shot_id===s.shot_id);
    if(matches.length!==1)throw Error('Exactly one source per planned shot required');
    const a=matches[0];a.source=localInput(a.source);
    if(!/\.(mp4|mov)$/i.test(a.source)||!Number.isFinite(a.start)||a.start<0)throw Error('Local video and numeric in point required');
    if(Number(probe(a.source).format.duration)+.05<a.start+s.end-s.start)throw Error('Source shorter than planned shot');
    if(!a.provenance?.provider||!a.provenance?.rights_reference)throw Error('Source provider and rights reference required');
  }
  const key=safeId(`${id}-v${c.edit_version}`);
  const out=path.join(ROOT,'video/out',key),pub=path.join(ROOT,'video/public/ingested',key);
  if(fs.existsSync(out)||fs.existsSync(pub))throw Error('Edit already exists; choose a new version');
  fs.mkdirSync(out,{recursive:true});fs.mkdirSync(pub,{recursive:true});
  const assets=[],scenes=[];
  for(const s of c.shots){
    const a=input.shots.find(x=>x.shot_id===s.shot_id),file=path.join(pub,safeId(s.shot_id)+'.mp4');
    const asset=normalize(a.source,file,a.start,s.end-s.start);
    assets.push({path:asset.path,sha256:asset.sha256,source_sha256:sha256(a.source),shot_id:s.shot_id,provenance:a.provenance});
    scenes.push({src:`ingested/${key}/${s.shot_id}.mp4`,durationFrames:Math.round((s.end-s.start)*30),label:s.purpose});
  }
  let state=transition(c,'GENERATED',{assets});
  const props={creativeId:id,editVersion:c.edit_version,scenes,hook:c.hook,productName:c.product_name,cta:c.cta,captions:input.captions||c.edit.captions,audioIntent:'silent',price:input.price||null};
  const product=input.product_snapshot||null;
  const check=preflight(c,props,{product});if(!check.pass)throw Error(check.errors.join('; '));
  const propsFile=path.join(out,'props.json');writeNew(propsFile,props);
  writeNew(path.join(out,'sources.json'),assets);
  const output=path.join(out,`${key}.mp4`);
  const renderOutput=path.join(out,`${key}-remotion.mp4`);
  const cliPackage=require.resolve('@remotion/cli/package.json',{paths:[path.join(ROOT,'video')]});
  const cli=path.join(path.dirname(cliPackage),'remotion-cli.js');
  run(process.execPath,[cli,'render',path.join(ROOT,'video/remotion/creative.tsx'),'SloaneCreative',renderOutput,'--props',propsFile,'--public-dir',path.join(ROOT,'video/public'),'--concurrency','2','--codec','h264','--pixel-format','yuv420p','--log=error']);
  exportSilent(renderOutput,output);
  state=transition(state,'EDITED',{output});
  const report=qa(output,path.join(out,'qa'),c,props,product);
  state=transition(state,'QA_PENDING',{output,qa:report});
  writeNew(path.join(out,'state.json'),state);
  writeNew(path.join(out,'tracking.json'),c.platforms.map(p=>tracking(c,p)));
  return {output,state:state.state,technical_pass:report.technical_pass,content_preflight_pass:report.content_preflight_pass,manual_review:path.join(out,'qa/manual-review.json')};
}
function review(key){
  safeId(key);const dir=path.join(ROOT,'video/out',key),state=read(path.join(dir,'state.json'));
  const output=path.join(dir,key+'.mp4');
  const context={output,qa:read(path.join(dir,'qa/report.json')),review:read(path.join(dir,'qa/manual-review.json'))};
  qaPassed(context);
  const next=transition(state,'QA_PASSED',context);
  writeNew(path.join(dir,'qa-passed.json'),next);
  return next;
}
function draft(key,contextFile){
  safeId(key);const dir=path.join(ROOT,'video/out',key),c=read(path.join(dir,'qa-passed.json'));
  const context={...read(contextFile),output:path.join(dir,key+'.mp4'),qa:read(path.join(dir,'qa/report.json')),review:read(path.join(dir,'qa/manual-review.json'))};
  // Policy is loaded from the reviewed configuration, never supplied by a draft input.
  delete context.policy;
  context.landing_url=tracking(c,context.destination?.platform).url;
  const result=preparePublishDraft(c,context);
  writeNew(path.join(dir,`draft-${context.destination.platform}.json`),result);
  return result;
}
if(require.main===module){try{
  const [cmd,id,arg,version]=process.argv.slice(2);
  const result=cmd==='prepare'?prepare(id):cmd==='finish'?finish(id,arg,version):cmd==='review'?review(id):cmd==='draft'?draft(id,arg):cmd==='status'?read(path.join(ROOT,'creative/sloane-concepts.json')).map(c=>({id:c.id,state:c.state,provider:c.generation_provider})):(()=>{throw Error('engine.cjs status | prepare SL001 | finish SL001 ingestion.json VERSION | review SL001-v1 | draft SL001-v1 context.json');})();
  console.log(JSON.stringify(result,null,2));
}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={prepare,finish,review,draft};
