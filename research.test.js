import test from 'node:test';
import assert from 'node:assert/strict';
import {assess,topics} from './public/extension/research-core.js';
test('research ranking explains observed thresholds and never fabricates missing signals',()=>{
 const best=assess({price:99000,rating:4.8,sold:150},300000);
 assert.equal(best.score,80);assert.equal(best.reasons.length,3);assert.match(best.label,/kiểm tra mẫu/);
 assert.ok(best.missing.includes('hoa hồng affiliate'));
 const missing=assess({price:null,rating:null,sold:null});assert.equal(missing.score,0);assert.equal(missing.missing.length,6);
 assert.equal(assess({price:400000,rating:4.2,sold:10},300000).score,0);
 assert.equal(assess({price:0,rating:null,sold:null}).score,0);
 assert.equal(assess({price:300000,rating:4.5,sold:100},300000).score,80);
 assert.equal(topics.room.queries.length,3);
});
