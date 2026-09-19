'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {sha256,localInput,writeNew}=require('../generation/providers/index.cjs');
const {preflight}=require('./creative.cjs');
function run(exe,args){const r=spawnSync(exe,args,{encoding:'utf8',shell:false,timeout:300000,maxBuffer:8*1024*1024});if(r.error)throw r.error;if(r.status!==0)throw Error((r.stderr||'Media process failed').slice(-2000));return r;}
function probe(file){return JSON.parse(run(process.env.FFPROBE_PATH||'ffprobe',['-v','error','-show_format','-show_streams','-of','json',localInput(file)]).stdout);}
function normalize(input,output,start,duration){
  input=localInput(input);
  const metadata=probe(input); const length=Number(metadata.format.duration);
  if(!Number.isFinite(start)||start<0||!Number.isFinite(duration)||duration<=0||start+duration>length+.05)throw Error('Invalid trim window');
  if(fs.existsSync(output))throw Error('Output already exists');
  fs.mkdirSync(path.dirname(output),{recursive:true});
  // Pad, never crop the product. Source audio deliberately removed for the silent-first workflow.
  run(process.env.FFMPEG_PATH||'ffmpeg',['-nostdin','-n','-i',input,'-ss',String(start),'-t',String(duration),'-map','0:v:0','-vf','scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0xf5f2eb,setsar=1,fps=30','-an','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',path.resolve(output)]);
  return {path:path.resolve(output),sha256:sha256(output),metadata:probe(output)};
}
function assessMetadata(data,expectedDuration,audioIntent){
  const flags=[],v=data.streams?.find(s=>s.codec_type==='video'),audio=data.streams?.some(s=>s.codec_type==='audio');
  if(!v) return ['No video stream'];
  if(v.width!==1080||v.height!==1920)flags.push('Expected 1080x1920');
  if(v.codec_name!=='h264'||v.pix_fmt!=='yuv420p')flags.push('Expected H.264 yuv420p');
  if(!data.format?.format_name?.split(',').includes('mp4'))flags.push('Expected MP4 container');
  const duration=Number(data.format?.duration);
  if(!Number.isFinite(duration)||Math.abs(duration-expectedDuration)>.15)flags.push('Duration mismatch');
  const [n,d]=v.avg_frame_rate.split('/').map(Number);
  if(!d||Math.abs(n/d-30)>.01)flags.push('Expected 30fps');
  if(!['silent','required'].includes(audioIntent))flags.push('Audio intent missing');
  if(audioIntent==='required'&&!audio)flags.push('Required audio absent');
  return flags;
}
function exportSilent(input,output){
  input=localInput(input);if(fs.existsSync(output))throw Error('Export already exists');
  // Remotion can label full-range output yuvj420p despite its pixel-format option.
  // Explicit range/matrix conversion makes the delivery format deterministic.
  run(process.env.FFMPEG_PATH||'ffmpeg',['-nostdin','-v','error','-n','-i',input,'-map','0:v:0','-an','-vf','scale=out_range=tv:out_color_matrix=bt709,format=yuv420p','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart',path.resolve(output)]);
  return output;
}
function qa(input,out,c,props,product=null){
  input=localInput(input); if(fs.existsSync(out))throw Error('QA revision already exists');
  fs.mkdirSync(out,{recursive:true});
  const data=probe(input), flags=assessMetadata(data,c.duration_seconds,props.audioIntent);
  try { run(process.env.FFMPEG_PATH||'ffmpeg',['-nostdin','-v','error','-xerror','-i',input,'-f','null','-']); } catch { flags.push('Full decode failed: corrupt/truncated media'); }
  let peakDb=null;
  if(data.streams.some(s=>s.codec_type==='audio')){
    const r=run(process.env.FFMPEG_PATH||'ffmpeg',['-nostdin','-i',input,'-vn','-af','volumedetect','-f','null','-']);
    const match=r.stderr.match(/max_volume:\s*(-?[\d.]+|\-inf) dB/);
    if(match)peakDb=match[1]==='-inf'?-999:Number(match[1]);
    if(peakDb===null)flags.push('Audio level could not be measured');
    else if(props.audioIntent==='silent'&&peakDb>-60)flags.push('Unexpected audible audio');
    else if(props.audioIntent==='required'&&peakDb<=-60)flags.push('Audio track is effectively silent');
    if(peakDb!==null&&peakDb>=0)flags.push('Audio reaches full scale: inspect clipping');
  }
  const stamps=new Set([0,...Array.from({length:Math.ceil(c.duration_seconds)},(_,i)=>i),...c.shots.slice(1).flatMap(s=>[s.start-1/30,s.start,s.start+1/30])]);
  let i=0;
  for(const t of [...stamps].sort((a,b)=>a-b))run(process.env.FFMPEG_PATH||'ffmpeg',['-nostdin','-v','error','-n','-ss',String(t),'-i',input,'-frames:v','1','-vf','scale=270:-1',path.join(out,`frame-${String(i++).padStart(3,'0')}.jpg`)]);
  const content=preflight(c,props,{product});
  const report={creative_id:c.creative_id,edit_version:c.edit_version,asset_sha256:sha256(input),checked_at:new Date().toISOString(),technical_pass:flags.length===0,content_preflight_pass:content.pass,flags,content,metadata:data,audio_peak_db:peakDb,manual_review:'PENDING',sample_count:i};
  writeNew(path.join(out,'report.json'),report);
  writeNew(path.join(out,'manual-review.json'),{asset_sha256:report.asset_sha256,reviewer:null,reviewed_at:null,approval_reference:null,checks:Object.fromEntries(['product_visible','product_fidelity','no_morphing','text_readable','no_clipping','hook_and_cta','audio_and_rights','claims_accurate','platform_overlays'].map(k=>[k,false])),notes:'Review full export plus front/back/detail references; reject changed collar, zip, panels, gray tone, hem, proportions or stitching. Check all transitions. Samples cannot establish perfect identity.'});
  return report;
}
module.exports={run,probe,normalize,assessMetadata,exportSilent,qa};
