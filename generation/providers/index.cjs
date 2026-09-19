'use strict';
// No network calls or credentials in this module. A manual job is a work order, not a generation.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const MODES = Object.freeze(['MANUAL_UNLIMITED', 'API_APPROVAL_REQUIRED', 'LOCAL', 'DISABLED']);
const MODES_BY_PROVIDER = Object.freeze({higgsfield_manual:'MANUAL_UNLIMITED', higgsfield_api:'API_APPROVAL_REQUIRED', open_higgsfield:'DISABLED', local:'LOCAL'});
function safeId(id) { if (typeof id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,95}$/.test(id)) throw Error('Unsafe identifier'); return id; }
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function localInput(file) {
  if (typeof file !== 'string' || /^(?:[a-z]+:\/\/|\\\\)/i.test(file)) throw Error('Local file required');
  const resolved = fs.realpathSync(file);
  if (!fs.statSync(resolved).isFile()) throw Error('Input must be a file');
  return resolved;
}
function writeNew(file, value) { fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file, JSON.stringify(value,null,2)+'\n', {flag:'wx'}); }
function createProvider(name, root) {
  const mode = MODES_BY_PROVIDER[name];
  if (!mode) throw Error('Unknown provider');
  const jobRoot = path.resolve(root);
  const jobPath = id => path.join(jobRoot, safeId(id)+'.json');
  function generate(kind, request) {
    if (mode === 'DISABLED') throw Error('Provider disabled after review');
    if (mode === 'API_APPROVAL_REQUIRED') throw Error('Paid API disabled: explicit budget approval and reviewed API adapter required');
    if (mode === 'LOCAL') throw Error('LOCAL supports asset ingestion, not local AI inference');
    safeId(request.creative_id); safeId(request.shot_id);
    if (!request.prompt?.trim() || !Array.isArray(request.reference_assets) || !request.reference_assets.length) throw Error('Prompt and product references required');
    const fingerprint=crypto.createHash('sha256').update(JSON.stringify({kind,prompt:request.prompt,references:request.reference_assets})).digest('hex').slice(0,24);
    const jobId=`${request.creative_id}-${request.shot_id}-${kind}-${fingerprint}`;
    if(fs.existsSync(jobPath(jobId)))return JSON.parse(fs.readFileSync(jobPath(jobId),'utf8'));
    const job = {
      job_id: jobId,
      creative_id:request.creative_id, shot_id:request.shot_id, kind, provider:name, mode,
      status:'AWAITING_MANUAL_GENERATION', prompt:request.prompt,
      reference_assets:request.reference_assets, created_at:new Date().toISOString(),
      cost:{estimated_usd:null, actual_usd:null, source:null},
      notice:'MANUAL_UNLIMITED is a workflow label; verify model eligibility in the official website before submitting. No generation was submitted.'
    };
    writeNew(jobPath(job.job_id), job);
    return job;
  }
  return {
    name, mode,
    generateImage:request => generate('image',request),
    generateVideo:request => generate('video',request),
    getJob:id => JSON.parse(fs.readFileSync(jobPath(id),'utf8')),
    downloadAsset({job_id, source, output, actual_cost_usd=null, cost_source=null}) {
      if (!['MANUAL_UNLIMITED','LOCAL'].includes(mode)) throw Error('Provider not enabled for ingestion');
      const job = name === 'local' ? null : this.getJob(job_id);
      if (job && job.status !== 'AWAITING_MANUAL_GENERATION') throw Error('Job already ingested');
      if (actual_cost_usd !== null && (!Number.isFinite(actual_cost_usd) || actual_cost_usd < 0 || !cost_source)) throw Error('Cost requires a nonnegative amount and source');
      source = localInput(source);
      if (!/\.(mp4|mov|png|jpe?g|webp)$/i.test(source)) throw Error('Unsupported asset type');
      const dest = path.resolve(output);
      if(fs.existsSync(dest)||fs.existsSync(dest+'.receipt.json'))throw Error('Refusing to overwrite asset or receipt');
      fs.mkdirSync(path.dirname(dest),{recursive:true});
      fs.copyFileSync(source,dest,fs.constants.COPYFILE_EXCL);
      const receipt = {job_id:job?.job_id ?? null, provider:name, asset:path.basename(dest), sha256:sha256(dest), bytes:fs.statSync(dest).size, ingested_at:new Date().toISOString(), cost:{actual_usd:actual_cost_usd,source:cost_source}};
      writeNew(dest+'.receipt.json',receipt);
      if (job) { job.status='INGESTED'; job.receipt=receipt; job.cost.actual_usd=actual_cost_usd; job.cost.source=cost_source; fs.writeFileSync(jobPath(job_id),JSON.stringify(job,null,2)+'\n'); }
      return receipt;
    }
  };
}
module.exports={MODES,MODES_BY_PROVIDER,createProvider,safeId,sha256,localInput,writeNew};
