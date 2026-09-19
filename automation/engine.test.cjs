'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createProvider,sha256,safeId}=require('../generation/providers/index.cjs');
const {transition,destinationAllowed,qaPassed,validApproval}=require('./workflow.cjs');
const {loadCreative,tracking,preflight}=require('./creative.cjs');
const {assessMetadata}=require('./qa.cjs');
const {diagnose}=require('./iterate.cjs');
const {mergeMeasurements}=require('./import-metrics.cjs');
const root=path.resolve(__dirname,'..');
test('all existing concepts validate and preserve unique platform ledger joins',()=>{
 const concepts=require('../creative/sloane-concepts.json'),rows=require('../analytics/experiments.json');
 assert.equal(new Set(concepts.map(c=>c.creative_id)).size,6);
 for(const c of concepts){loadCreative(c.id,root);for(const p of c.platforms){const matched=rows.filter(r=>r.creative_id===c.id&&r.platform===p);assert.equal(matched.length,1);assert.equal(new URL(tracking(c,p).url).searchParams.get('utm_content'),matched[0].utm_content);}}
});
test('paid and disabled providers cannot submit or ingest',()=>{
 for(const n of ['higgsfield_api','open_higgsfield']){const p=createProvider(n,os.tmpdir());assert.throws(()=>p.generateVideo({}));assert.throws(()=>p.downloadAsset({}));}
});
test('manual jobs persist without generation and local ingestion refuses overwrites',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sloane-job-'));
 try{const p=createProvider('higgsfield_manual',dir);const job=p.generateVideo({creative_id:'SL001',shot_id:'S01',prompt:'test',reference_assets:['reference']});assert.equal(job.status,'AWAITING_MANUAL_GENERATION');assert.equal(p.getJob(job.job_id).cost.actual_usd,null);const source=path.join(dir,'source.mp4');fs.writeFileSync(source,'fixture');const output=path.join(dir,'copy.mp4');const receipt=p.downloadAsset({job_id:job.job_id,source,output});assert.equal(receipt.sha256,sha256(source));assert.equal(p.getJob(job.job_id).status,'INGESTED');assert.throws(()=>p.downloadAsset({job_id:job.job_id,source,output}));}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('unsafe job paths rejected',()=>{for(const id of ['../x','C:\\x','a/b',''])assert.throws(()=>safeId(id));});
test('wrong social brand and handles blocked regardless of approved list',()=>{
 const policy={private_policy_present:true,blocked:[{brand_id:'blocked-fixture'},{platform:'tiktok',account:'blockedfixture'}],approved:[]};
 for(const d of [{provider:'metricool',brand_id:'blocked-fixture',platform:'instagram',account:'new'},{provider:'metricool',brand_id:'new',platform:'tiktok',account:'@BlockedFixture'}])assert.throws(()=>destinationAllowed(d,policy),/DO_NOT_USE/);
 assert.throws(()=>destinationAllowed({provider:'metricool',brand_id:'new',platform:'instagram',account:'sloane'},policy),/not explicitly approved/);
});
test('fresh checkout without a verified private policy cannot allow destinations',()=>{
 assert.throws(()=>destinationAllowed({provider:'metricool',brand_id:'test',platform:'instagram',account:'test'},{private_policy_present:false,blocked:[],approved:[]}),/private destination policy/);
});
test('state machine forbids skipped gates and missing generated assets',()=>{
 const c=loadCreative('SL001',root);assert.throws(()=>transition(c,'PUBLISHED'),/Illegal/);assert.throws(()=>transition(c,'GENERATED'),/assets/);assert.throws(()=>transition({...c,state:'QA_PENDING'},'QA_PASSED'),/output missing/);
});
test('hash-bound QA rejects incomplete human checks and changed exports',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sloane-qa-')),file=path.join(dir,'export.mp4');
 try{fs.writeFileSync(file,'v1');const hash=sha256(file),qa={asset_sha256:hash,technical_pass:true,content_preflight_pass:true};const review={asset_sha256:hash,reviewer:'test reviewer',reviewed_at:new Date().toISOString(),approval_reference:'test only',checks:Object.fromEntries(['product_visible','product_fidelity','no_morphing','text_readable','no_clipping','hook_and_cta','audio_and_rights','claims_accurate','platform_overlays'].map(k=>[k,true]))};assert.equal(qaPassed({output:file,qa,review}),hash);assert.throws(()=>qaPassed({output:file,qa,review:{...review,checks:{}}}),/incomplete/);fs.writeFileSync(file,'v2');assert.throws(()=>qaPassed({output:file,qa,review}),/QA not passed/);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('approval binds creative, revision, export hash, action and destination',()=>{
 const c=loadCreative('SL001',root),d={provider:'metricool',brand_id:'new',platform:'instagram',account:'sloane'};
 const a={action:'schedule',creative_id:'SL001',edit_version:1,asset_sha256:'hash',user_approval_reference:'test only',approved_at:new Date().toISOString(),expires_at:new Date(Date.now()+60000).toISOString(),destination:d};
 validApproval(a,'schedule',c,'hash',d);
 for(const changed of [{...a,action:'publish'},{...a,edit_version:2},{...a,asset_sha256:'other'},{...a,expires_at:'2000-01-01'}])assert.throws(()=>validApproval(changed,'schedule',c,'hash',d));
 assert.throws(()=>validApproval(a,'schedule',c,'hash',{...d,account:'other'}));
});
function props(c){return {creativeId:c.id,editVersion:c.edit_version,hook:c.hook,cta:c.cta,productName:c.product_name,scenes:c.shots.map(s=>({src:s.shot_id+'.mp4',durationFrames:(s.end-s.start)*30})),captions:[],price:null};}
test('content preflight enforces price freshness and exact Shopify variant amount',()=>{
 const c=loadCreative('SL001',root),p=props(c);assert.equal(preflight(c,p).pass,true);
 p.price={variant_id:'variant',amount:'54.99',currency:'USD'};assert.equal(preflight(c,p).pass,false);
 const product={id:c.product_id,checked_at:new Date().toISOString(),currencyCode:'USD',variants:[{id:'variant',price:'54.99'}]};assert.equal(preflight(c,p,{product}).pass,true);
 assert.equal(preflight(c,p,{product:{...product,checked_at:'2000-01-01'}}).pass,false);assert.equal(preflight(c,{...p,price:{...p.price,amount:'49.99'}},{product}).pass,false);
});
test('content preflight flags missing/overflowing text and captions outside timeline',()=>{
 const c=loadCreative('SL001',root),p=props(c);assert.equal(preflight(c,{...p,cta:''}).pass,false);assert.equal(preflight(c,{...p,hook:'a'.repeat(100)}).pass,false);assert.equal(preflight(c,{...p,captions:[{start:1,end:20,text:'too late'}]}).pass,false);
});
test('metadata QA rejects wrong codec, size, duration and missing intended audio',()=>{
 const data={streams:[{codec_type:'video',codec_name:'h264',width:1080,height:1920,pix_fmt:'yuv420p',avg_frame_rate:'30/1'}],format:{format_name:'mov,mp4,m4a',duration:'15'}};
 assert.deepEqual(assessMetadata(data,15,'silent'),[]);assert.ok(assessMetadata(data,15,'required').length);assert.ok(assessMetadata(data,12,'silent').length);assert.ok(assessMetadata({...data,streams:[{...data.streams[0],width:720,codec_name:'vp9'}]},15,'silent').length>=2);
});
test('iteration avoids conclusions without provenance, sample or comparable baseline',()=>{
 assert.equal(diagnose({creative_id:'SL001'}).status,'INSUFFICIENT_DATA');
 const row={creative_id:'SL001',platform:'instagram',source:'export',attribution_window:'7d',platform_post_id:'1',video_starts:1000,three_second_views:100};
 assert.equal(diagnose(row,null).status,'NEEDS_COMPARABLE_BASELINE');const b={...row,three_second_views:600};assert.equal(diagnose(row,b).next_test.variable,'opening_shot');assert.equal(diagnose({...row,video_starts:10,three_second_views:1},b).status,'INSUFFICIENT_DATA');
});
test('measurement import preserves nulls and rejects mixed posts, stale exports and bad metrics',()=>{
 const ledger=[{creative_id:'SL001',platform:'instagram',edit_version:1,spend:null,impressions:null}];
 const o={creative_id:'SL001',platform:'instagram',edit_version:1,source:'test fixture, not live data',attribution_window:'7d',observed_at:'2026-09-19T00:00:00Z',platform_post_id:'test',impressions:0};
 const rows=mergeMeasurements(ledger,[o]);assert.equal(rows[0].spend,null);assert.equal(rows[0].impressions,0);assert.equal(ledger[0].impressions,null);
 assert.throws(()=>mergeMeasurements(rows,[o]),/Stale/);assert.throws(()=>mergeMeasurements(rows,[{...o,platform_post_id:'other'}]),/different post/);assert.throws(()=>mergeMeasurements(ledger,[{...o,likes:-1}]),/Invalid metric/);assert.throws(()=>mergeMeasurements(ledger,[{...o,source:null}]),/source/);
});
