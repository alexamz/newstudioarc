// Single-user Gym Voice extraction contract. No secret or Azure endpoint in client code.
export const SCHEMA={type:"object",additionalProperties:false,required:["exercises","unresolved","needsReview"],properties:{
 exercises:{type:"array",items:{type:"object",additionalProperties:false,required:["name","sourceFragment","sets","reviewReason"],properties:{
 name:{type:["string","null"]},sourceFragment:{type:"string"},reviewReason:{type:["string","null"]},
 sets:{type:"array",items:{type:"object",additionalProperties:false,required:["reps","weightKg"],properties:{
 reps:{type:["integer","null"]},weightKg:{type:["number","null"]}}}}}}},
 unresolved:{type:"array",items:{type:"string"}},needsReview:{type:"boolean"}}};
export const PROMPT=[
"Extract a Spanish gym workout from noisy iPhone dictation. Return only valid schema JSON.",
"Normalize exercise names only when unambiguous. The list of planned exercises may help disambiguate, but never invent what happened.",
"Example: 'press banca tres series de 10,40 kilos y dos de 10,45 kilos' means 3 sets of 10 reps at 40 kg and 2 sets of 10 at 45 kg, not decimal weights.",
"An explicit 'doce coma cinco kilos' does mean 12.5 kg. A strange extra number like '5 y 6,50' must cause review, not silent deletion.",
"If the next exercise is transcribed as 'ps' or is unintelligible, set name to null and ask what it was; never assume curl de bíceps.",
"If any rep or weight is missing, use null. 'Sin peso/sin lastre/peso corporal' means 0 additional kg when explicit.",
"Never fabricate sets, names or weights. Use sourceFragment for each exercise. If uncertain, add a reviewReason and unresolved question and set needsReview true.",
"Only integers for reps. Ignore rest times when counting reps. Output every actual set separately."
].join("\n");
export function buildRequest(text,routine,model){
 if(typeof text!=="string"||!text.trim()||text.length>2200||typeof routine!=="string"||routine.length>1500||!model)throw Error("Bad model request");
 return {model,store:false,tools:[],max_output_tokens:1800,input:[
 {role:"system",content:PROMPT},{role:"user",content:JSON.stringify({dictation:text,routineContext:routine})}
 ],text:{format:{type:"json_schema",name:"GymWorkoutExtract",strict:true,schema:SCHEMA}}};
}
export function validateResult(data){
 if(!data||!Array.isArray(data.exercises)||data.exercises.length>12||!Array.isArray(data.unresolved)||data.unresolved.length>20||typeof data.needsReview!=="boolean")throw Error("Invalid model structure");
 const issues=[];
 for(const s of data.unresolved){if(typeof s!=="string"||!s.trim()||s.length>250)throw Error("Invalid question");issues.push(s)}
 const entries=data.exercises.map(e=>{
  if(!e||!(e.name===null||typeof e.name==="string")||typeof e.sourceFragment!=="string"||e.sourceFragment.length>1000||!(e.reviewReason===null||typeof e.reviewReason==="string")||!Array.isArray(e.sets)||e.sets.length>20)throw Error("Invalid exercise");
  const name=e.name===null?null:e.name.trim().slice(0,70);
  if(name==="")throw Error("Empty exercise");
  if(e.reviewReason){if(e.reviewReason.length>250)throw Error("Invalid review");issues.push(e.reviewReason)}
  if(!name)issues.push("Ejercicio sin identificar: "+e.sourceFragment.slice(0,80));
  if(!e.sets.length)issues.push("No hay series reconocidas para "+(name||"ejercicio desconocido"));
  const sets=e.sets.map(s=>{
   if(!s||!(s.reps===null||(Number.isInteger(s.reps)&&s.reps>=1&&s.reps<=40))||!(s.weightKg===null||(Number.isFinite(s.weightKg)&&s.weightKg>=0&&s.weightKg<=500)))throw Error("Invalid series");
   if(s.reps===null||s.weightKg===null)issues.push("Faltan repeticiones o kilos: "+(name||"ejercicio sin identificar"));
   return {reps:s.reps,weight:s.weightKg};
  });
  return {name:name||"Ejercicio sin identificar",sets};
 });
 if(!entries.length&&!issues.length)throw Error("No interpretation produced");
 if(issues.length&&!data.needsReview)throw Error("Missing needsReview");
 if(data.needsReview&&!issues.length)issues.push("Hay dudas de interpretación que debes revisar");
 return {entries,unresolved:[...new Set(issues)].slice(0,20),needsReview:data.needsReview||!!issues.length};
}
export function unpackResponse(body){
 if(!body||body.status!=="completed"||!Array.isArray(body.output))throw Error("Model incomplete");
 const c=body.output.flatMap(x=>x.type==="message"&&Array.isArray(x.content)?x.content:[]);
 if(c.some(x=>x.type==="refusal"))throw Error("Model refused");
 const output=c.filter(x=>x.type==="output_text"&&typeof x.text==="string").map(x=>x.text).join("");
 if(!output||output.length>30000)throw Error("Missing model output");
 return validateResult(JSON.parse(output));
}
