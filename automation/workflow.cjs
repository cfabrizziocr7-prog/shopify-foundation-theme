'use strict';
const {sha256} = require('../generation/providers/index.cjs');
const fs = require('node:fs');
const path = require('node:path');
function loadPolicy() {
  const file=path.resolve(__dirname,'../social/private/destinations.json');
  // Connection identities stay local. A fresh checkout has no authorized destination.
  if(!fs.existsSync(file))return {...require('../social/destinations.json'),private_policy_present:false};
  return {...JSON.parse(fs.readFileSync(file,'utf8')),private_policy_present:true};
}
const EDGES = Object.freeze({
  IDEA:['RESEARCHED'], RESEARCHED:['SCRIPTED'], SCRIPTED:['SHOT_PLANNED'],
  SHOT_PLANNED:['GENERATION_READY','GENERATION_PENDING_APPROVAL'],
  GENERATION_PENDING_APPROVAL:['GENERATION_READY'], GENERATION_READY:['GENERATED'],
  GENERATED:['EDITED'], EDITED:['QA_PENDING'], QA_PENDING:['QA_PASSED','EDITED'],
  QA_PASSED:['READY_TO_SCHEDULE','EDITED'], READY_TO_SCHEDULE:['SCHEDULED','EDITED'],
  SCHEDULED:['PUBLISHED'], PUBLISHED:['MEASURING'], MEASURING:['ITERATE','ARCHIVED'], ITERATE:['RESEARCHED'], ARCHIVED:[]
});
function required(ok,message) { if (!ok) throw Error(message); }
function destinationAllowed(d, policy=loadPolicy()) {
  required(policy.private_policy_present===true,'Verified private destination policy required');
  required(d && d.provider && d.brand_id && d.platform && d.account,'Destination identity incomplete');
  const account = String(d.account).replace(/^@/,'').toLowerCase();
  required(!policy.blocked.some(b => (b.brand_id && String(b.brand_id) === String(d.brand_id)) || (b.platform === d.platform && b.account.toLowerCase() === account)), 'DO_NOT_USE_FOR_SLOANE');
  required(policy.approved.some(a => a.provider===d.provider && String(a.brand_id)===String(d.brand_id) && a.platform===d.platform && a.account.toLowerCase()===account && a.approval_reference), 'Destination not explicitly approved');
  return true;
}
function validApproval(a, action, creative, assetHash, destination) {
  required(a?.action===action && a.creative_id===creative.creative_id && a.edit_version===creative.edit_version && a.asset_sha256===assetHash && a.user_approval_reference && a.approved_at && Date.parse(a.expires_at)>Date.now(), 'Missing, expired or mismatched user approval');
  required(JSON.stringify(a.destination)===JSON.stringify(destination),'Approval is for a different destination');
}
function qaPassed(context) {
  const {qa, review, output}=context;
  required(output && fs.existsSync(output),'Final output missing');
  const hash=sha256(output);
  required(qa?.asset_sha256===hash && qa.technical_pass===true && qa.content_preflight_pass===true,'Technical/content QA not passed for this export');
  required(review?.asset_sha256===hash && review.reviewer && review.reviewed_at && review.approval_reference,'Manual review absent or stale');
  for (const k of ['product_visible','product_fidelity','no_morphing','text_readable','no_clipping','hook_and_cta','audio_and_rights','claims_accurate','platform_overlays']) required(review.checks?.[k]===true,'Manual review incomplete: '+k);
  return hash;
}
function transition(item,next,context={}) {
  required(EDGES[item.state]?.includes(next),`Illegal state transition ${item.state} -> ${next}`);
  if(next==='RESEARCHED') required(item.research?.method && item.hypothesis,'Research rationale and hypothesis required');
  if(next==='SCRIPTED') required(item.hook && item.script && item.caption,'Script, hook and caption required');
  if(next==='SHOT_PLANNED') required(item.shots?.length && item.reference_assets?.length,'Shot plan and references required');
  if(next==='GENERATION_READY') {
    required(item.shots?.every(s=>s.prompt),'Per-shot prompts required');
    if(item.state==='GENERATION_PENDING_APPROVAL') required(context.generation_approval?.user_approval_reference && context.generation_approval.creative_id===item.creative_id && Number.isFinite(context.generation_approval.max_usd),'Specific generation budget approval required');
  }
  if(next==='GENERATED') required(context.assets?.length===item.shots.length && context.assets.every(a=>a.path && fs.existsSync(a.path) && a.sha256===sha256(a.path)),'All source assets and matching hashes required');
  if(next==='EDITED') required(context.output && fs.existsSync(context.output),'Rendered output required');
  if(next==='QA_PENDING') required(context.qa?.asset_sha256 && context.output && context.qa.asset_sha256===sha256(context.output),'QA report for this export required');
  if(['QA_PASSED','READY_TO_SCHEDULE','SCHEDULED'].includes(next)) qaPassed(context);
  if(['READY_TO_SCHEDULE','SCHEDULED','PUBLISHED'].includes(next)) {
    destinationAllowed(context.destination,context.policy || loadPolicy());
    required(context.store_launch_verified===true,'Store launch and destination link must be verified');
  }
  if(next==='SCHEDULED') {
    required((context.policy||loadPolicy()).publishing_enabled===true,'Publishing adapter disabled');
    validApproval(context.approval,'schedule',item,sha256(context.output),context.destination);
    required(context.receipt?.schedule_id && context.receipt.creative_id===item.creative_id,'Verified scheduler receipt required');
  }
  if(next==='PUBLISHED') {
    validApproval(context.approval,'publish',item,qaPassed(context),context.destination);
    required(context.receipt?.platform_post_id && context.receipt.status==='published' && context.receipt.creative_id===item.creative_id,'Verified published receipt required');
  }
  if(next==='MEASURING') required(context.metrics_source && context.platform_post_id,'Real metrics source and post ID required');
  if(next==='ITERATE') required(context.decision?.hypothesis && context.decision?.variable,'Iteration hypothesis and one changed variable required');
  return {...item,state:next,history:[...(item.history||[]),{from:item.state,to:next,at:new Date().toISOString()}]};
}
// Intentionally no HTTP publisher: return a reviewable LOCAL draft, never a scheduled post.
function preparePublishDraft(item,context) {
  required(item.state==='QA_PASSED','Creative must reach QA_PASSED first');
  const ready=transition(item,'READY_TO_SCHEDULE',context);
  return {creative_id:item.creative_id,edit_version:item.edit_version,state:ready.state,destination:context.destination,asset_sha256:sha256(context.output),caption:item.caption,cta:item.cta,landing_url:context.landing_url,status:'LOCAL_REVIEW_ONLY',schedule_time:null,publish_approval:null};
}
module.exports={EDGES,transition,destinationAllowed,validApproval,qaPassed,preparePublishDraft};
