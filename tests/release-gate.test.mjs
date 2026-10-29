import test from 'node:test';
import assert from 'node:assert/strict';
import {handler} from '../netlify/functions/lib/api-handler.mjs';
import {seal} from '../netlify/functions/lib/security.mjs';
import {RELEASE_AT,ADMIN_USER_ID,releaseOpen,isReleaseAdmin} from '../netlify/functions/lib/release-gate.mjs';
process.env.SESSION_SECRET='release-tests-secret-at-least-32-characters';
const before=Date.parse(RELEASE_AT)-1,after=Date.parse(RELEASE_AT);
const event=(path,extra={})=>({path,httpMethod:'GET',headers:{},...extra});
const run=(path,extra={},time=before)=>handler(event(path,extra),{now:()=>time});
const auth=id=>({cookie:'ow_session='+seal({kind:'session',token:'private-admin-token',userId:id,exp:Date.now()+60000})});
test('release boundary is exactly November 29 midnight UTC and admins use numeric identity',()=>{
 assert.equal(RELEASE_AT,'2026-11-29T00:00:00.000Z');assert.equal(releaseOpen(before),false);assert.equal(releaseOpen(after),true);
 assert.ok(isReleaseAdmin({id:ADMIN_USER_ID}));assert.ok(!isReleaseAdmin({id:12,username:'ronaldonater'}));assert.ok(!isReleaseAdmin({id:String(ADMIN_USER_ID)}));
});
test('pre-release visitors cannot fetch any review, global, replay or image route',async()=>{
 const realFetch=globalThis.fetch;globalThis.fetch=()=>{throw Error('blocked visitors must not reach upstream');};
 try{for(const path of ['/wrapped','/global','/replay','/global-replay','/avatar','/artist-image','/medal-image','/cover']){
  for(const headers of [{},auth(99)]){const r=await run('/api'+path,{headers});assert.equal(r.statusCode,423,path);assert.equal(r.headers['Cache-Control'],'no-store');assert.equal(r.headers['Netlify-CDN-Cache-Control'],'no-store');}
 }}finally{globalThis.fetch=realFetch;}
});
test('release status distinguishes admin, non-admin, tampering, and automatic public release',async()=>{
 for(const [headers,allowed] of [[{},false],[auth(99),false],[auth(ADMIN_USER_ID),true],[{cookie:'ow_session=invalid'},false]]){
  const r=await run('/api/release',{headers});assert.equal(r.statusCode,200);assert.equal(JSON.parse(r.body).allowed,allowed);assert.equal(r.headers['Cache-Control'],'no-store');assert.ok(!r.body.includes('private-admin-token'));
 }
 assert.equal(JSON.parse((await run('/api/release',{},after)).body).allowed,true);
 assert.equal((await run('/api/wrapped',{},after)).statusCode,401);
 const admin=await run('/api/avatar',{headers:auth(ADMIN_USER_ID),queryStringParameters:{id:'invalid'}});assert.equal(admin.statusCode,400);
});
test('existing sessions are verified against osu and admin status is sealed, never taken from a query',async()=>{
 const realFetch=globalThis.fetch;let id=99,calls=0;
 globalThis.fetch=async url=>{assert.ok(String(url).endsWith('/me'));calls++;return {ok:true,json:async()=>({id,username:'ronaldonater'})};};
 const headers={cookie:'ow_session='+seal({kind:'session',token:'old-token',exp:Date.now()+60000})};
 try{
  assert.equal(JSON.parse((await run('/api/release',{headers,queryStringParameters:{admin:'true',userId:String(ADMIN_USER_ID)}})).body).allowed,false);
  id=ADMIN_USER_ID;const r=await run('/api/release',{headers});assert.equal(JSON.parse(r.body).allowed,true);assert.match(r.headers['Set-Cookie'],/HttpOnly/);assert.equal(calls,2);
 }finally{globalThis.fetch=realFetch;}
});
test('OAuth denies non-admins before release but permits the verified owner',async()=>{
 process.env.OSU_CLIENT_ID='test-client';process.env.OSU_CLIENT_SECRET='test-secret';process.env.OSU_REDIRECT_URI='https://example.com/api/auth/callback';
 const realFetch=globalThis.fetch;let id=99;globalThis.fetch=async url=>String(url).endsWith('/oauth/token')?{ok:true,json:async()=>({access_token:'oauth-token',expires_in:3600})}:{ok:true,json:async()=>({id})};
 const oauthState='a'.repeat(48);const headers={cookie:'ow_state='+seal({kind:'oauth-state',state:oauthState,exp:Date.now()+60000})};
 try{
  const denied=await run('/api/auth/callback',{headers,queryStringParameters:{state:oauthState,code:'test-code'}});assert.equal(denied.headers.Location,'/?error=admin');assert.ok(denied.multiValueHeaders['Set-Cookie'].some(row=>row.startsWith('ow_session=;')));
  id=ADMIN_USER_ID;const granted=await run('/api/auth/callback',{headers,queryStringParameters:{state:oauthState,code:'test-code'}});assert.equal(granted.headers.Location,'/?connected=1');assert.ok(granted.multiValueHeaders['Set-Cookie'].some(row=>row.startsWith('ow_session=')&&!row.startsWith('ow_session=;')));
 }finally{globalThis.fetch=realFetch;}
});
