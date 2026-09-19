const {test}=require('node:test'),assert=require('node:assert/strict');const {metrics,trackedUrl}=require('./report.cjs');
test('unknown data and zero denominators stay unknown',()=>{assert.equal(metrics({}).roas,null);assert.equal(metrics({spend:10,conversions:0}).cpa,null);assert.equal(metrics({spend:0,revenue:10}).roas,null)});
test('real zero numerator remains zero',()=>{assert.equal(metrics({clicks:0,impressions:100}).ctr,0)});
test('performance math uses matching denominators',()=>{const m=metrics({spend:20,clicks:10,impressions:1000,conversions:2,revenue:100,sessions:50});assert.equal(m.ctr,.01);assert.equal(m.cpa,10);assert.equal(m.roas,5);assert.equal(m.conversion_rate,.04)});
test('rejects invalid values and insecure destination',()=>{assert.throws(()=>metrics({spend:-1}));assert.throws(()=>metrics({clicks:'10'}));assert.throws(()=>trackedUrl('http://example.com',{}))});
test('UTM encoding preserves existing variant',()=>{const u=new URL(trackedUrl('https://example.com/p?variant=123',{utm_content:'sloane a'}));assert.equal(u.searchParams.get('variant'),'123');assert.equal(u.searchParams.get('utm_content'),'sloane a')});
