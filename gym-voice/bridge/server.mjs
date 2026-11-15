// Azure Container Apps single origin: static PWA + authenticated AI interpretation.
import http from "node:http";
import {readFileSync} from "node:fs";
import {createHash,timingSafeEqual} from "node:crypto";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
import {buildRequest,unpackResponse} from "./core.mjs";
const ROOT=dirname(fileURLToPath(import.meta.url));
const STATIC={"/":"index.html","/index.html":"index.html","/manifest.webmanifest":"manifest.webmanifest","/sw.js":"sw.js","/icon.svg":"icon.svg"};
const MIME={html:"text/html; charset=utf-8",webmanifest:"application/manifest+json",js:"application/javascript; charset=utf-8",svg:"image/svg+xml"};
function json(res,status,body){res.writeHead(status,{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"});res.end(JSON.stringify(body))}
function allow(value,secret){
 if(typeof secret!=="string"||secret.length<40||typeof value!=="string"||!value.startsWith("Bearer "))return false;
 const a=createHash("sha256").update(value.slice(7)).digest(),b=createHash("sha256").update(secret).digest();
 return timingSafeEqual(a,b);
}
export async function identity(fetcher=fetch,env=process.env){
 if(!env.IDENTITY_ENDPOINT||!env.IDENTITY_HEADER)throw Error("Managed Identity unavailable");
 const url=new URL(env.IDENTITY_ENDPOINT);url.searchParams.set("resource","https://cognitiveservices.azure.com/");url.searchParams.set("api-version","2019-08-01");
 const response=await fetcher(url,{headers:{"X-IDENTITY-HEADER":env.IDENTITY_HEADER},signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw Error("Azure MI failed");const data=await response.json();if(!data.access_token)throw Error("Missing token");return data.access_token;
}
export async function model({text,routine},fetcher=fetch,env=process.env){
 const endpoint=env.AZURE_OPENAI_ENDPOINT,deployment=env.AZURE_OPENAI_DEPLOYMENT;
 if(!endpoint||!deployment)throw Error("Azure AI unconfigured");
 const url=new URL(endpoint);if(url.protocol!=="https:"||!url.hostname.endsWith(".openai.azure.com"))throw Error("Azure AI endpoint invalid");
 const token=await identity(fetcher,env);
 const response=await fetcher(new URL("/openai/v1/responses",url),{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+token},body:JSON.stringify(buildRequest(text,routine,deployment)),signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error("Azure AI response: "+response.status);
 return unpackResponse(await response.json());
}
async function bodyJson(req){
 let bytes=0,parts=[];
 for await(const chunk of req){bytes+=chunk.length;if(bytes>8500)throw Error("Input too large");parts.push(chunk)}
 return JSON.parse(Buffer.concat(parts).toString("utf8"));
}
export function handler({env=process.env,infer=model,root=ROOT}={}){
 // Defensive ceiling per process, NOT a durable billing limit after cold starts.
 let day=Date.now(),usage=0;
 return async(req,res)=>{
  const path=new URL(req.url||"/","http://localhost").pathname;
  if(req.method==="GET"&&path==="/healthz")return json(res,200,{status:"ready"});
  if(req.method==="POST"&&path==="/api/interpret"){
   if(!allow(req.headers.authorization,env.GYM_ACCESS_TOKEN))return json(res,401,{error:"Acceso personal no autorizado"});
   if(Date.now()-day>86400000){day=Date.now();usage=0}
   if(usage>=30)return json(res,429,{error:"Límite temporal de peticiones alcanzado"});
   let input;try{input=await bodyJson(req);if(!input||typeof input.text!=="string"||!input.text.trim()||input.text.length>2200||typeof input.routine!=="string"||input.routine.length>1500)throw Error("Invalid input")}
   catch(e){return json(res,400,{error:"Dictado o contexto inválido"})}
   usage++;
   try{return json(res,200,await infer({text:input.text,routine:input.routine},fetch,env))}
   catch(e){console.error("Gym AI failure:",String(e.message).slice(0,80));return json(res,502,{error:"IA no disponible; no se ha guardado nada"})}
  }
  if(req.method==="GET"&&Object.hasOwn(STATIC,path)){
   const name=STATIC[path],bytes=readFileSync(join(root,name));
   res.writeHead(200,{"content-type":MIME[name.split(".").pop()],"cache-control":name==="index.html"?"no-store":"public, max-age=3600","x-content-type-options":"nosniff","referrer-policy":"no-referrer"});
   return res.end(bytes);
  }
  return json(res,404,{error:"Not found"});
 };
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 http.createServer(handler()).listen(Number(process.env.PORT)||8080,"0.0.0.0",()=>console.log("Gym Voice up"));
}
