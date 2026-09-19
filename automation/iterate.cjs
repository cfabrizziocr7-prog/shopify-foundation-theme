'use strict';
const {metrics}=require('./report.cjs');
// Operational review thresholds, not statistically validated success benchmarks.
function diagnose(row,baseline){
  const m=metrics(row),hypotheses=[];
  const result={creative_id:row.creative_id,platform:row.platform,status:'INSUFFICIENT_DATA',hypotheses,metrics:m,causal_claim:false};
  if(!row.source||!row.attribution_window||!row.platform_post_id)return result;
  if(!baseline?.source||baseline.platform!==row.platform||baseline.attribution_window!==row.attribution_window)return {...result,status:'NEEDS_COMPARABLE_BASELINE'};
  const b=metrics(baseline);
  const enough=(field,min)=>row[field]>=min&&baseline[field]>=min;
  const below=(key)=>m[key]!==null&&b[key]!==null&&b[key]>0&&m[key]<b[key]*.8;
  if(enough('video_starts',500)&&below('three_second_hold'))hypotheses.push({stage:'hook',hypothesis:'Early hold is lower than the comparable baseline; test a different opening shot.',variable:'opening_shot'});
  if(enough('impressions',1000)&&enough('video_starts',500)&&m.three_second_hold!==null&&b.three_second_hold!==null&&!below('three_second_hold')&&below('ctr'))hypotheses.push({stage:'interest',hypothesis:'Hold is comparable but click rate is lower; test CTA specificity.',variable:'cta'});
  if(enough('sessions',100)&&below('add_to_cart_rate'))hypotheses.push({stage:'product_page',hypothesis:'Product-page visits are not becoming carts at the baseline rate; review fit/offer clarity.',variable:'fit_information'});
  if(enough('add_to_cart_sessions',30)&&row.checkout_sessions!=null&&baseline.checkout_sessions!=null&&row.checkout_sessions/row.add_to_cart_sessions<baseline.checkout_sessions/baseline.add_to_cart_sessions*.8)hypotheses.push({stage:'cart',hypothesis:'Cart-to-checkout is lower; inspect shipping visibility and cart errors.',variable:'shipping_information'});
  if(enough('checkout_sessions',30)&&row.conversions!=null&&baseline.conversions!=null&&row.conversions/row.checkout_sessions<baseline.conversions/baseline.checkout_sessions*.8)hypotheses.push({stage:'checkout',hypothesis:'Checkout completion is lower; inspect costs and payment friction.',variable:'checkout_friction'});
  result.status=hypotheses.length?'REVIEW_HYPOTHESES':enough('sessions',100)||enough('video_starts',500)?'NO_CLEAR_SIGNAL':'INSUFFICIENT_DATA';
  result.next_test=hypotheses[0]||null;
  return result;
}
if(require.main===module){const fs=require('node:fs');const rows=JSON.parse(fs.readFileSync(process.argv[2]||(fs.existsSync('analytics/private/experiments.json')?'analytics/private/experiments.json':'analytics/experiments.json'),'utf8'));const baselineId=process.argv[3];const decisions=rows.map(r=>r.creative_id===baselineId?{creative_id:r.creative_id,platform:r.platform,status:'BASELINE_ROW'}:diagnose(r,rows.find(b=>b.creative_id===baselineId&&b.platform===r.platform)));fs.mkdirSync('analytics/private',{recursive:true});fs.writeFileSync('analytics/private/decisions.json',JSON.stringify({generated_at:new Date().toISOString(),baseline_id:baselineId||null,decisions},null,2));console.log(JSON.stringify(decisions,null,2));}
module.exports={diagnose};
