'use strict';
const fs=require('node:fs');
const {trackedUrl}=require('./report.cjs');
function validateCreative(c) {
  if(!/^SL\d{3}$/.test(c.creative_id) || c.id!==c.creative_id) throw Error('Creative ID must preserve existing SL convention');
  if(!Number.isInteger(c.edit_version)||c.edit_version<1) throw Error('Invalid edit version');
  for(const key of ['product_id','hook','script','caption','cta','destination_url','hypothesis']) if(!c[key]) throw Error('Missing '+key);
  if(new URL(c.destination_url).protocol!=='https:') throw Error('HTTPS destination required');
  let end=0;
  for(const s of c.shots) { if(s.start!==end||!Number.isFinite(s.end)||s.end<=s.start||!s.prompt||!s.shot_id) throw Error('Non-contiguous or incomplete shot plan'); end=s.end; }
  if(end!==c.duration_seconds||end<4||end>30) throw Error('Shot plan duration mismatch');
  if(!c.reference_assets?.length) throw Error('Product references missing');
  return c;
}
function loadCreative(id,root=process.cwd()) {
  const path=require('node:path');
  const c=JSON.parse(fs.readFileSync(path.join(root,'creative/sloane-concepts.json'),'utf8')).find(x=>x.id===id);
  if(!c)throw Error('Unknown creative');
  return validateCreative(c);
}
function tracking(c,platform) {
  if(!c.platforms.includes(platform))throw Error('Unsupported platform');
  const row={creative_id:c.creative_id,utm_source:platform,utm_medium:'organic_social',utm_campaign:c.utm_campaign,utm_content:c.utm_content};
  return {...row,url:trackedUrl(c.destination_url,row)};
}
function preflight(c,props,{product=null,now=Date.now()}={}) {
  const errors=[];
  if(props.creativeId!==c.creative_id||props.editVersion!==c.edit_version)errors.push('Creative/edit identity mismatch');
  if(props.hook!==c.hook||props.cta!==c.cta||!props.productName)errors.push('Hook/CTA/product text missing or mismatched');
  if(props.scenes?.length!==c.shots.length)errors.push('Missing shot assets');
  if((props.scenes||[]).some((s,i)=>!s.src||s.durationFrames!==Math.round((c.shots[i]?.end-c.shots[i]?.start)*30)))errors.push('Invalid scene duration/asset');
  // These limits prevent obvious overflow, not a claim of OCR or visual readability.
  for(const [key,limit] of Object.entries({hook:95,cta:65,productName:60}))if(typeof props[key]!=='string'||props[key].length>limit)errors.push('Text length exceeds layout budget: '+key);
  let last=0;
  for(const cap of props.captions||[]) { if(!Number.isFinite(cap.start)||!Number.isFinite(cap.end)||cap.start<last||cap.end<=cap.start||cap.end>c.duration_seconds||!cap.text||cap.text.length>85)errors.push('Invalid caption window/length'); last=cap.end; }
  if(props.price) {
    if(!product || product.id!==c.product_id || !Number.isFinite(Date.parse(product.checked_at)) || now-Date.parse(product.checked_at)>86400000 || Date.parse(product.checked_at)>now)errors.push('Price requires a fresh Shopify snapshot (<24h)');
    else if(!product.variants?.some(v=>v.id===props.price.variant_id&&v.price===props.price.amount)||product.currencyCode!==props.price.currency)errors.push('Price differs from Shopify variant');
  }
  return {pass:errors.length===0,errors,limitations:['Text budget checks are not visual readability verification.','Product visibility, garment identity, audio rights and platform overlays require manual review.']};
}
module.exports={validateCreative,loadCreative,tracking,preflight};
