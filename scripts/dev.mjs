import http from 'node:http';
import {createServer as createViteServer} from 'vite';
try{process.loadEnvFile();}catch(error){if(error.code!=='ENOENT')throw error;}
const port=Number(process.env.PORT || 8888);
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost:'+port);
  if(url.pathname.startsWith('/api/') || url.pathname.startsWith('/.netlify/functions/api/')){
   const request=new Request(url,{method:req.method,headers:req.headers});
   const {default:api}=await vite.ssrLoadModule('/netlify/functions/api.mjs');
   const response=await api(request);
   for(const [name,value] of response.headers)if(name!=='set-cookie')res.setHeader(name,value);
   const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);
   res.writeHead(response.status);res.end(Buffer.from(await response.arrayBuffer()));return;
  }
  vite.middlewares(req,res,()=>{res.writeHead(404);res.end('Not found');});
 }catch(error){console.error('Local request failed:',error.name);res.writeHead(500,{'Content-Type':'text/plain'});res.end('Local request failed. Check configuration.');}
});
const vite=await createViteServer({server:{middlewareMode:true,hmr:{server}},appType:'spa'});
server.on('error',async error=>{console.error(error.code==='EADDRINUSE'?'Port '+port+' is already in use. Stop the other local server first.':error.message);await vite.close();process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log('Local app and OAuth backend: http://localhost:'+port));
async function close(){server.close();await vite.close();process.exit(0);}
process.on('SIGINT',close);process.on('SIGTERM',close);
