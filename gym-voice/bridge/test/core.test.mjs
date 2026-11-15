import test from "node:test";
import assert from "node:assert/strict";
import {buildRequest,validateResult,unpackResponse} from "../core.mjs";
import {identity,model,handler} from "../server.mjs";
const response=data=>({status:"completed",output:[{type:"message",content:[{type:"output_text",text:JSON.stringify(data)}]}]});
test("5 bench press sets recovered as structured model data",()=>{
 const sets=[...Array(3).fill({reps:10,weightKg:40}),...Array(2).fill({reps:10,weightKg:45})];
 const result=unpackResponse(response({exercises:[{name:"press banca",sourceFragment:"3 de 10 40 kilos y 2 de 10 45 kilos",reviewReason:null,sets}],unresolved:[],needsReview:false}));
 assert.deepEqual(result.entries[0].sets.map(s=>s.weight),[40,40,40,45,45]);
});
test("Unknown ps never becomes invented curl of biceps",()=>{
 const result=validateResult({exercises:[{name:null,sourceFragment:"ps con 12,5",sets:[{reps:12,weightKg:12.5}],reviewReason:"No se reconoce ps"}],unresolved:["¿Qué ejercicio era?"],needsReview:true});
 assert.equal(result.entries[0].name,"Ejercicio sin identificar");assert.equal(result.needsReview,true);
});
test("Missing values cannot silently pass as confident",()=>{
 const result={exercises:[{name:"remo",sourceFragment:"remo con 40 kilos",sets:[{reps:null,weightKg:40}],reviewReason:null}],unresolved:[],needsReview:false};
 assert.throws(()=>validateResult(result),/needsReview/);
});
test("Responses request has strict schema and store false",()=>{
 const request=buildRequest("press banca 3x10 a 40 kilos","","m4b-validation");
 assert.equal(request.store,false);assert.deepEqual(request.tools,[]);assert.equal(request.text.format.strict,true);
});
test("Azure MI token uses identity header instead of API key",async()=>{
 const f=async(url,opts)=>{assert.match(String(url),/cognitiveservices/);assert.equal(opts.headers["X-IDENTITY-HEADER"],"rotated");return {ok:true,json:async()=>({access_token:"mi-token"})}};
 assert.equal(await identity(f,{IDENTITY_ENDPOINT:"http://127.0.0.1/msi",IDENTITY_HEADER:"rotated"}),"mi-token");
});
test("Model receives strict provider output then validates it",async()=>{
 let n=0;const f=async(url)=>{n++;return n===1?{ok:true,json:async()=>({access_token:"mi-token"})}:{ok:true,json:async()=>response({exercises:[{name:"remo",sourceFragment:"remo 10 40",sets:[{reps:10,weightKg:40}],reviewReason:null}],unresolved:[],needsReview:false})}};
 const outcome=await model({text:"remo 10 40",routine:""},f,{IDENTITY_ENDPOINT:"http://127.0.0.1/msi",IDENTITY_HEADER:"mi",AZURE_OPENAI_ENDPOINT:"https://example.openai.azure.com",AZURE_OPENAI_DEPLOYMENT:"m4b-validation"});
 assert.equal(outcome.entries[0].sets[0].weight,40);assert.equal(n,2);
});
test("API refuses unknown personal token",async()=>{
 let status;const app=handler({env:{GYM_ACCESS_TOKEN:"s".repeat(48)},infer:async()=>{throw Error("not reached")}});
 await app({url:"/api/interpret",method:"POST",headers:{authorization:"Bearer wrong"}},{writeHead:s=>{status=s},end:()=>{}});
 assert.equal(status,401);
});
