const fs=require('fs');
const out={};
for (const f of ['th1','th2']){
  const s=fs.readFileSync(f+'.js','utf8');
  const i=s.indexOf('const DATA');let depth=0,j=s.indexOf('{',i);
  for(let k=j;k<s.length;k++){if(s[k]=='{')depth++;else if(s[k]=='}'){depth--;if(depth==0){j=k;break}}}
  const pre=s.slice(0,i), data=s.slice(i,j+1)+';';
  const h0=s.indexOf('const rnd ='), h1=s.indexOf('const esc');
  const helpers=s.slice(h0,h1);
  const iife='(function(){\n'+pre+data+'\n'+helpers+'\nreturn {D:DATA,fmt:fmt,parseNum:parseNum,near:near};\n})()';
  fs.writeFileSync(f+'_iife.js',iife);
  const T=eval(iife); const D=T.D;
  out[f]={concepts:D.concepts.map(c=>({id:c.id,t:c.title,talk:c.talk,traps:c.traps||[],why:c.why||[]})),cards:D.cards,quiz:D.quiz,
    gens:Object.fromEntries(Object.entries(D.gens).map(([k,g])=>[k,{c:g.c,method:g.method}])),
    worked:D.worked.map(w=>({id:w.id,t:w.title,gen:w.gen})),sprints:D.sprints.map(w=>({id:w.id,t:w.title}))};
  // sanity run generators
  for(const k in D.gens){for(let r=0;r<200;r++){const o=D.gens[k].make();if(o.ans==null||isNaN(o.ans))throw k}}
  for(const w of D.worked){for(let r=0;r<100;r++){const o=w.make();o.steps.forEach(st=>{if(isNaN(st.ans))throw w.id})}}
  for(const w of D.sprints){for(let r=0;r<100;r++){w.make()}}
}
fs.writeFileSync('th.json',JSON.stringify(out,null,1));
console.log('ok', Object.keys(out.th2.gens), out.th2.worked.map(w=>w.id+':'+w.gen));
