import test from 'node:test';
import assert from 'node:assert/strict';
import {handler} from '../netlify/functions/api.mjs';
import {seal} from '../netlify/functions/lib/security.mjs';
process.env.SESSION_SECRET='test-session-secret-at-least-32-characters';
const event=(path,extra={})=>({path,headers:{},httpMethod:'GET',...extra});
test('API requires a session and validates rulesets',async()=>{
 assert.equal((await handler(event('/api/wrapped'))).statusCode,401);
 const headers={cookie:`ow_session=${seal({token:'test',exp:Date.now()+10000})}`};
 assert.equal((await handler(event('/api/wrapped',{headers,queryStringParameters:{mode:'invalid'}}))).statusCode,400);
});
test('OAuth rejects invalid state before exchanging any token',async()=>{
 const r=await handler(event('/api/auth/callback',{queryStringParameters:{code:'bad',state:'bad'}}));
 assert.equal(r.statusCode,302);assert.equal(r.headers.Location,'/?error=login');
});
test('logout rejects cross-origin requests',async()=>{
 process.env.OSU_REDIRECT_URI='https://example.netlify.app/api/auth/callback';
 assert.equal((await handler(event('/api/auth/logout',{httpMethod:'POST',headers:{origin:'https://attacker.example'}}))).statusCode,403);
 const r=await handler(event('/api/auth/logout',{httpMethod:'POST',headers:{origin:'https://example.netlify.app'}}));
 assert.equal(r.statusCode,200);assert.match(r.headers['Set-Cookie'],/Max-Age=0/);
});
test('wrapped fetch uses authenticated identity and selected mode',async()=>{
 const original=globalThis.fetch;const requests=[];
 globalThis.fetch=async(url,options)=>{requests.push([url,options.headers.Authorization]);return {ok:true,json:async()=>url.includes('/me/')?{id:123,username:'test',monthly_playcounts:[]}:[]};};
 try{
 const headers={cookie:`ow_session=${seal({token:'private-token',exp:Date.now()+10000})}`};
 const r=await handler(event('/.netlify/functions/api/wrapped',{headers,queryStringParameters:{mode:'mania'}}));
 assert.equal(r.statusCode,200);assert.equal(JSON.parse(r.body).mode,'mania');assert.equal(requests.length,3);assert.ok(requests[0][0].endsWith('/me/mania'));assert.ok(requests[1][0].includes('/users/123/'));assert.equal(requests[0][1],'Bearer private-token');assert.equal(r.headers['Cache-Control'],'no-store');assert.ok(!r.body.includes('private-token'));
 }finally{globalThis.fetch=original;}
});

