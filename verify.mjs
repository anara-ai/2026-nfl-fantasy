import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const data = fs.readFileSync(new URL('./data.js', import.meta.url), 'utf8');
const js = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
const elements = new Map();
const element = id => {
  if (!elements.has(id)) elements.set(id, {innerHTML:'',textContent:'',classList:{add(){},remove(){},toggle(){}},style:{}});
  return elements.get(id);
};
const saved = new Map();
const context = vm.createContext({
  window:{scrollY:0,scrollTo(){}}, navigator:{},
  document:{getElementById:element,querySelectorAll:()=>[],body:{style:{}},activeElement:null},
  localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},
  setTimeout:()=>0,clearTimeout(){},confirm:()=>true,console
});
vm.runInContext(data,context);
vm.runInContext(js,context);
const {D,P}=context;
const ids=new Set(P.map(p=>p.id));
assert.equal(ids.size,P.length,'Unique player IDs');
assert.equal(new Set(P.map(p=>p.n)).size,P.length,'Unique names');
for(let i=1;i<=234;i++)assert.ok(ids.has(i),'Original ID retained: '+i);
assert.equal(P.filter(p=>p.p==='DEF').length,32);
assert.equal(new Set(P.filter(p=>p.p==='DEF').map(p=>p.t)).size,32);
assert.equal(D.league.rounds,14);
assert.deepEqual(Array.from(D.league.picks),[3,18,23,38,43,58,63,78,83,98,103,118,123,138]);
assert.equal(D.plan.length,14);
assert.equal(D.league.scoring.interception,-1);
assert.equal(D.league.scoring.passTD,4);
assert.equal(D.league.scoring.reception,0.5);
assert.equal(D.league.scoring.defense.pointsAllowed35plus,-4);
for(const p of P){
  assert.equal(p.inj,null,'No unsupported injury percentage');
  assert.ok(!p.sg||(!p.avoid&&Math.abs(p.gap)>=8),'Valid price badge: '+p.n);
  if(p.gap!==null)assert.ok(Math.abs(p.gap-(p.src.ADP-p.src.ECR))<0.051,'ADP gap calculation');
  if(p.mean)assert.equal(p.rk,p.src.ECR,'Keep sourced ECR order');
  if(p.t!=='FA')assert.ok(D.byes[String(p.b)]?.includes(p.t),'Team bye matches: '+p.n);
  for(const [,url] of p.links)assert.ok(url.startsWith('https://'),'HTTPS source');
  const rendered=context.playerView(p);
  assert.ok(!/undefined|NaN|chance of missing time|so he lasts here/.test(rendered),'Valid profile: '+p.n);
}
for(const pl of D.plan){
  assert.equal(pl.pick,D.league.picks[pl.round-1]);
  for(const name of pl.targets)assert.ok(P.some(p=>p.n===name),'Plan target exists: '+name);
}
for(const name of ['Josh Jacobs','Ricky Pearsall','Jayden Higgins','Isiah Pacheco','Zach Charbonnet','Jordyn Tyson']){
  const p=P.find(x=>x.n===name);
  assert.ok(p?.avoid&&!p.sg,'Unavailable excluded: '+name);
  assert.ok(!context.avail().some(x=>x.id===p.id),'No unavailable best recommendation');
}
const chase=P.find(p=>p.n==="Ja'Marr Chase");
assert.equal(chase.id,3,'Legacy Chase ID');
context.mark(chase.id,true);
context.mark(chase.id,true);
assert.equal(context.st.order.length,1,'Double tap does not create a duplicate pick');
assert.equal(context.st.mine.length,1);
const reloaded=context.load();
assert.equal(reloaded.mine[0],3,'Draft state reloads using legacy key');
assert.ok(saved.has('draft2026.v1'));
context.undo();
assert.equal(context.st.order.length,0);
assert.equal(context.nextPick(),3);
// A normal lineup without an extra RB/WR/TE still needs its FLEX.
context.st={gone:{},mine:[],order:[]};
for(const [pos,count] of [['QB',1],['RB',2],['WR',2],['TE',1],['K',1],['DEF',1]]){
  context.st.mine.push(...P.filter(p=>p.p===pos&&!p.avoid).slice(0,count).map(p=>p.id));
}
assert.deepEqual(Array.from(context.needs().missing,x=>x.p),['FLEX']);
const flex=P.find(p=>p.p==='WR'&&!context.st.mine.includes(p.id));
context.st.mine.push(flex.id);
assert.equal(context.needs().missing.length,0);
assert.match(context.teamPane(),/Lineup complete/);
for(let n=0;n<=140;n++){
  context.st.order=Array.from({length:n},(_,i)=>i+1);
  const expected=D.league.picks.find(p=>p>=n+1)??null;
  assert.equal(context.nextPick(),expected,'Next pick after '+n+' selections');
  assert.ok(!/Round 15|NaN|undefined/.test(context.boardPane()));
}
for(const f of ['ALL','RB','WR','TE','QB','K/D']){context.filter=f;assert.ok(context.boardPane());}
for(const seg of ['news','edges','byes','about']){context.seg=seg;assert.ok(context.briefPane());}
assert.ok(context.planPane());
context.q='Pearsall';assert.match(context.results(),/Ricky Pearsall/);
assert.ok(!/Q WK1|Q Wk1|Seven boards|chance of missing time/.test(html));
console.log(`Verified ${P.length} profiles, 32 defenses, source gaps, 14-round turns, draft/undo/reload, FLEX and all app panes.`);
