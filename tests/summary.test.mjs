import test from 'node:test';
import assert from 'node:assert/strict';
import {summarize,inYear} from '../src/summary.js';
import {seal,unseal} from '../netlify/functions/lib/security.mjs';
const score=(id,date,pp=100)=>({id,ended_at:date,pp,accuracy:.98,max_combo:400,passed:true,beatmapset:{creator:'Mapper',artist:'Artist'}});
test('year uses UTC boundaries',()=>{assert.equal(inYear('2025-12-31T23:59:59Z'),false);assert.equal(inYear('2026-01-01T00:00:00Z'),true);assert.equal(inYear('2027-01-01T00:00:00Z'),false);});
test('filters years, deduplicates endpoints, excludes failures from PP and accuracy',()=>{const s=score(1,'2026-02-03T00:00:00Z');const fail={...score(2,s.ended_at,900),passed:false,accuracy:.1};const r=summarize({monthly_playcounts:[{start_date:'2025-01-01',count:999},{start_date:'2026-01-01',count:10}],user_achievements:[{achieved_at:s.ended_at}]},[s,score(3,'2025-01-01')],[s,fail],'osu');assert.equal(r.sampleCount,2);assert.equal(r.accuracy,98);assert.equal(r.top.length,1);assert.equal(r.top[0].pp,100);assert.equal(r.playcount,10);assert.equal(r.medals,1);assert.equal(r.mappers[0].count,2);assert.equal(r.replayViews,null);});
test('empty score data is unavailable, not fabricated zero',()=>{const r=summarize({},[],[],'mania');assert.equal(r.accuracy,null);assert.equal(r.combo,null);assert.equal(r.playcount,null);assert.deepEqual(r.top,[]);});
test('sessions reject tampering and expiry',()=>{process.env.SESSION_SECRET='test-secret-32-characters-long-enough';const token=seal({token:'private',exp:Date.now()+60000});assert.equal(unseal(token).token,'private');assert.equal(unseal(token.slice(0,-5)+'abcde'),null);assert.equal(unseal(seal({exp:Date.now()-1})),null);});

