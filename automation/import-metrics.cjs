'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {metrics}=require('./report.cjs');
const FIELDS=['spend','impressions','clicks','video_starts','three_second_views','completions','views','watch_time_seconds','likes','comments','saves','shares','profile_visits','sessions','product_views','add_to_cart_sessions','checkout_sessions','conversions','revenue','refunds'];
function mergeMeasurements(ledger,observations){
 const next=structuredClone(ledger),seen=new Set();
 for(const o of observations){
  const key=o.creative_id+':'+o.platform;
  if(seen.has(key))throw Error('Duplicate observation');seen.add(key);
  if(!o.source||!o.attribution_window||!o.platform_post_id||!Number.isFinite(Date.parse(o.observed_at)))throw Error('Real source, post ID, observation date and attribution window required');
  const matches=next.filter(r=>r.creative_id===o.creative_id&&r.platform===o.platform);
  if(matches.length!==1)throw Error('Unknown or ambiguous creative/platform');
  const row=matches[0];
  if(row.platform_post_id && row.platform_post_id!==o.platform_post_id)throw Error('A different post needs a separate experiment row; do not combine posts');
  if(row.observed_at && Date.parse(o.observed_at)<=Date.parse(row.observed_at))throw Error('Stale or duplicate observation');
  if(row.attribution_window && row.attribution_window!==o.attribution_window)throw Error('Attribution window changed; create a separate observation series');
  if(o.edit_version!==row.edit_version)throw Error('Edit version mismatch');
  for(const k of FIELDS)if(Object.hasOwn(o,k)){if(o[k]!==null&&(!Number.isFinite(o[k])||o[k]<0))throw Error('Invalid metric '+k);row[k]=o[k];}
  for(const k of ['source','attribution_window','platform_post_id','observed_at'])row[k]=o[k];
  row.result='measuring';metrics(row);
 }
 return next;
}
if(require.main===module){try{
 const dir=path.resolve(__dirname,'../analytics/private');fs.mkdirSync(dir,{recursive:true});
 const file=path.join(dir,'experiments.json');
 const rows=JSON.parse(fs.readFileSync(fs.existsSync(file)?file:path.resolve(__dirname,'../analytics/experiments.json'),'utf8'));
 const observations=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
 const next=mergeMeasurements(rows,observations);
 fs.writeFileSync(path.join(dir,`observations-${crypto.randomUUID()}.json`),JSON.stringify(observations,null,2),{flag:'wx'});
 const tmp=file+'.tmp';fs.writeFileSync(tmp,JSON.stringify(next,null,2)+'\n',{flag:'wx'});fs.renameSync(tmp,file);
 console.log('Updated private experiment ledger. No publishing, scheduling or spend occurred.');
}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={mergeMeasurements,FIELDS};
