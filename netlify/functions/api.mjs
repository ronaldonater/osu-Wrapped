import {randomBytes,timingSafeEqual} from 'node:crypto';
import {seal,unseal,cookie,cookies} from './lib/security.mjs';
import {summarize} from '../../src/summary.js';
const json=(statusCode,body,extra={})=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...extra},body:JSON.stringify(body)});
const redirect=(to,setCookies=[])=>({statusCode:302,headers:{Location:to,'Cache-Control':'no-store'},multiValueHeaders:{'Set-Cookie':setCookies},body:''});
async function osu(path,token){const res=await fetch(`https://osu.ppy.sh/api/v2${path}`,{headers:{Authorization:`Bearer ${token}`,Accept:'application/json','x-api-version':'20220705'},signal:AbortSignal.timeout(12000)});if(!res.ok){const error=new Error(res.status===429?'osu! is busy. Please wait a minute and try again.':'Unable to retrieve osu! data. Please try signing in again.');error.status=res.status===401?401:502;throw error;}return res.json();}
export async function handler(event){
 try{
 const path=event.path.replace(/^\/.netlify\/functions\/api/,'/api');const jar=cookies(event);
 if(path==='/api/auth/login'){
  if(!process.env.OSU_CLIENT_ID||!process.env.OSU_CLIENT_SECRET||!process.env.OSU_REDIRECT_URI)return json(503,{error:'Login is not configured yet. Add the osu! OAuth environment variables in Netlify. You can explore the demo now.'});
  const state=randomBytes(24).toString('hex');const url=new URL('https://osu.ppy.sh/oauth/authorize');url.search=new URLSearchParams({client_id:process.env.OSU_CLIENT_ID,redirect_uri:process.env.OSU_REDIRECT_URI,response_type:'code',scope:'identify public',state}).toString();
  return redirect(url.toString(),[cookie('ow_state',seal({state,exp:Date.now()+600000}),600)]);
 }
 if(path==='/api/auth/callback'){
  const q=event.queryStringParameters||{};const saved=unseal(jar.ow_state||'');
  if(!saved||!q.state||q.state.length!==saved.state.length||!timingSafeEqual(Buffer.from(q.state),Buffer.from(saved.state))||!q.code)return redirect('/?error=login',[cookie('ow_state','',0)]);
  const res=await fetch('https://osu.ppy.sh/oauth/token',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({client_id:process.env.OSU_CLIENT_ID,client_secret:process.env.OSU_CLIENT_SECRET,code:q.code,grant_type:'authorization_code',redirect_uri:process.env.OSU_REDIRECT_URI}),signal:AbortSignal.timeout(12000)});
  if(!res.ok)return redirect('/?error=login',[cookie('ow_state','',0)]);
  const token=await res.json();const age=Math.min(Number(token.expires_in)||3600,86400);
  return redirect('/?connected=1',[cookie('ow_session',seal({token:token.access_token,exp:Date.now()+age*1000}),age),cookie('ow_state','',0)]);
 }
 if(path==='/api/auth/logout'){
  if(event.httpMethod!=='POST')return json(405,{error:'Method not allowed'});
  const expected=new URL(process.env.OSU_REDIRECT_URI).origin;
  if(event.headers.origin!==expected)return json(403,{error:'Invalid origin'});
  return json(200,{ok:true},{'Set-Cookie':cookie('ow_session','',0)});
 }
 if(path==='/api/wrapped'){
  const session=unseal(jar.ow_session||'');if(!session)return json(401,{error:'Sign in with osu! to generate your Wrapped.'});
  const mode=event.queryStringParameters?.mode||'osu';if(!['osu','taiko','fruits','mania'].includes(mode))return json(400,{error:'Invalid game mode'});
  const user=await osu(`/me/${mode}`,session.token);
  const [best,recent]=await Promise.all([osu(`/users/${user.id}/scores/best?mode=${mode}&limit=100&legacy_only=0`,session.token),osu(`/users/${user.id}/scores/recent?mode=${mode}&limit=100&include_fails=1&legacy_only=0`,session.token)]);
  return json(200,summarize(user,best,recent,mode));
 }
 return json(404,{error:'Not found'});
 }catch(error){console.error('Wrapped request failed:',error.name);return json(error.status||500,{error:error.status?error.message:'Could not generate your Wrapped. Check deployment configuration or try again shortly.'});}
}

