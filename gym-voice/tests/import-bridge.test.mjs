import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join,dirname} from "node:path";
import {fileURLToPath} from "node:url";
const here=dirname(fileURLToPath(import.meta.url));
const html=readFileSync(join(here,"..","index.html"),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,"Inline app script found");
function boot(hash){
 const nodes={};
 const doc={getElementById(id){return nodes[id]??(nodes[id]={innerHTML:"",value:"",checked:false,style:{},className:""});}};
 const loc={hash,href:"https://example.invalid/gym-voice/index.html"+hash,protocol:"https:",hostname:"example.invalid"};
 const run=new Function("localStorage","document","location","window","navigator","history","setTimeout","URL","Blob",script+";return {getDraft:()=>draft,getIssues:()=>issues,getOriginal:()=>original,getNotice:()=>importNotice,chooseMode,interpret};");
 return {app:run({getItem:()=>null,setItem:()=>{}},doc,loc,{addEventListener:()=>{}},{},{replaceState:()=>{}},()=>{},null,null),nodes};
}
const payload={v:1,source:"chatgpt",raw:"Press banca, tres series de 10,40 kilos y dos series de 10,45 kilos",entries:[{name:"press banca",sets:[...Array.from({length:3},()=>({reps:10,weight:40})),...Array.from({length:2},()=>({reps:10,weight:45}))]}],unresolved:[]};
test("Structured import appears first, with five sets and no basic-parser warning",()=>{
 const {app,nodes}=boot("#import="+encodeURIComponent(JSON.stringify(payload)));
 assert.equal(app.getDraft()[0].sets.length,5);
 assert.equal(app.getIssues().length,0);
 assert.equal(app.getOriginal(),payload.raw);
 assert.ok(nodes.screen.innerHTML.includes("5 series recibidas"));
 assert.ok(nodes.screen.innerHTML.includes("Entrenamiento interpretado"));
 assert.ok(!nodes.screen.innerHTML.includes("Interpretar (básico)"));
 assert.ok(!nodes.screen.innerHTML.includes("Faltan repeticiones"));
 assert.ok(nodes.screen.innerHTML.includes('id="r0_4"'));
 assert.ok(nodes.screen.innerHTML.includes('id="w0_4"'));
 app.chooseMode("final");
 assert.equal(app.getOriginal(),payload.raw);
 assert.equal(app.getDraft()[0].sets.length,5);
 app.interpret();
 assert.equal(app.getDraft()[0].sets.length,5);
 assert.equal(app.getIssues().length,0);
});
test("Unstructured raw voice input still uses basic parser",()=>{
 const {app,nodes}=boot("#voice="+encodeURIComponent(payload.raw));
 assert.equal(app.getNotice(),"");
 assert.ok(nodes.screen.innerHTML.includes("Interpretar (básico)"));
});
test("Invalid structured payload cannot be imported as a workout",()=>{
 const {app}=boot("#import="+encodeURIComponent(JSON.stringify({...payload,entries:[{name:"press banca",sets:[{reps:98,weight:40}]}]})));
 assert.equal(app.getDraft().length,0);
});
