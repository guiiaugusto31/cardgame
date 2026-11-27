'use strict';
/* Duelo 1x1 — o servidor é a autoridade: cartas, dano e turnos são calculados aqui. */
const {CARDS,CLS,EVO}=require('./cards.js');
const rnd=n=>Math.floor(Math.random()*n);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
const pick=a=>a[rnd(a.length)];
const HP={g:135,m:148,fo:118,ag:116,lu:108,tr:104},TURN_MS=45000,MAX_ROUNDS=30;
function calc(b,str,weak,vuln){let v=b+str;if(weak>0)v*=.75;if(vuln>0)v*=1.5;return Math.max(0,Math.floor(v));}
function evoFx(hero,evo){if(!evo||!evo.t)return {};const C=EVO[hero];const fx={...C.t1.fx};if(evo.trail&&evo.t>=2){const T=C.trails[evo.trail];Object.assign(fx,(evo.t>=3?T.t3:T.t2).fx);}return fx;}
function evOK(c,evo){if(!c.ev)return true;if(!evo||!evo.t)return false;if(c.ev==='t1')return evo.t>=1;if(c.ev==='sig')return false;return evo.t>=2&&evo.trail===c.ev;}
function draftOptions(hero,evo){const pool=Object.values(CARDS).filter(c=>c.cls===hero&&c.rar!=='s'&&evOK(c,evo));const out=[];
 while(out.length<3){const r=Math.random()*100,rar=r<55?'c':r<92?'u':'r';const l=pool.filter(c=>c.rar===rar&&!out.includes(c.id));if(l.length)out.push(pick(l).id);}return out;}
function mkPlayer(hero,picks,evo){const ids=[...CLS[hero].deck,...picks];if(evo&&evo.t>=3&&evo.trail)ids.push(EVO[hero].trails[evo.trail].sig);const fx=evoFx(hero,evo);
 return {hero,fx,rg:0,pl:0,ss:0,na:0,hp:HP[hero],mhp:HP[hero],blk:fx.blk0||0,str:fx.str0||0,weak:0,vuln:0,pw:{ritual:0,plated:0,insight:0},energy:0,
  draw:shuffle(ids.map((id,k)=>({id,uid:k}))),disc:[],hand:[],exh:[]};}
function drawN(p,n){for(let i=0;i<n;i++){if(p.hand.length>=10)break;if(!p.draw.length){if(!p.disc.length)break;p.draw=shuffle(p.disc);p.disc=[];}p.hand.push(p.draw.pop());}}
function startTurn(D){const p=D.p[D.turn];if(D.tn[D.turn]>0)p.blk=Math.floor(p.blk*(p.fx.keep||0));p.pl=0;p.energy=3+(D.tn[D.turn]===0&&D.turn===D.second?1:0);p.str+=p.pw.ritual;D.tn[D.turn]++;drawN(p,5+p.pw.insight+(D.tn[D.turn]===1&&D.turn===D.second?1:0)+(D.tn[D.turn]===1?(p.fx.draw0||0):0));D.deadline=Date.now()+TURN_MS;D.round=Math.max(D.tn[0],D.tn[1]);}
function newDuel(a,b){const D={p:[mkPlayer(a.hero,a.picks,a.evo),mkPlayer(b.hero,b.picks,b.evo)],turn:rnd(2),tn:[0,0],last:null,over:false,winner:null,round:1};D.second=1-D.turn;D.p[0].vuln+=D.p[1].fx.vulnstart||0;D.p[1].vuln+=D.p[0].fx.vulnstart||0;startTurn(D);return D;}
function hit(t,amt){const ab=Math.min(t.blk,amt);t.blk-=ab;const r=amt-ab;t.hp=Math.max(0,t.hp-r);if(r>0&&t.fx.rage&&t.rg<t.fx.rage){t.rg++;t.str++;}}
function check(D){if(D.over)return;const [a,b]=D.p;if(a.hp<=0&&b.hp<=0){D.over=true;D.winner=1-D.turn;}else if(a.hp<=0){D.over=true;D.winner=1;}else if(b.hp<=0){D.over=true;D.winner=0;}}
function effCost(me,d){const f=me.fx.first0||0;return d.cost&&me.pl<f?d.cost-1:d.cost;}
function play(D,who,idx){if(D.over||D.turn!==who)return false;const me=D.p[who],op=D.p[1-who];const c=me.hand[idx];if(!c)return false;const d=CARDS[c.id];const ec=effCost(me,d);if(ec>me.energy)return false;
 me.energy-=ec;const hpB=op.hp;me.hand.splice(idx,1);
 if(d.nrg)me.energy+=d.nrg;if(d.selfdmg){me.hp=Math.max(0,me.hp-d.selfdmg);if(me.fx.selfstr&&me.ss<me.fx.selfstr){me.ss++;me.str++;}}
 if(d.type==='atk'){me.na++;if(me.fx.atkstr&&me.na%me.fx.atkstr===0)me.str++;if(me.fx.atkblk)me.blk+=me.fx.atkblk;}
 if(d.bodyslam||d.dmg){const base=d.bodyslam?me.blk:d.dmg;for(let k=0;k<(d.hits||1);k++){if(op.hp<=0)break;hit(op,calc(base,me.str,me.weak,op.vuln));}}
 if(op.hp>0){if(d.vuln)op.vuln+=d.vuln;if(d.weak)op.weak+=d.weak;}
 if(d.str)me.str+=d.str;if(d.blk)me.blk+=d.blk;if(d.heal)me.hp=Math.min(me.mhp,me.hp+d.heal);
 if(d.power)me.pw[d.power]+=d.amt;if(d.draw)drawN(me,d.draw);
 if(d.power){}else if(d.exhaust)me.exh.push(c);else me.disc.push(c);
  if(me.fx.drain){const dl=hpB-op.hp;if(dl>0)me.hp=Math.min(me.mhp,me.hp+Math.floor(dl*me.fx.drain));}
 me.pl++;
 if(me.fx.flow){if(me.pl%3===0){me.energy++;if(me.fx.flow>=2)drawN(me,me.fx.flow-1);}}
 D.last={by:who,id:c.id};check(D);return true;}
function endTurn(D,who){if(D.over||D.turn!==who)return false;const me=D.p[who];
 if(me.fx.reflect&&me.blk>0){hit(D.p[1-who],Math.floor(me.blk*me.fx.reflect));check(D);if(D.over)return true;}
 me.disc.push(...me.hand);me.hand=[];me.blk+=me.pw.plated+(me.fx.plated||0);if(me.fx.healturn)me.hp=Math.min(me.mhp,me.hp+me.fx.healturn);if(me.weak>0)me.weak--;if(me.vuln>0)me.vuln--;
 if(D.tn[0]>=MAX_ROUNDS&&D.tn[1]>=MAX_ROUNDS){D.over=true;const [a,b]=D.p;const ra=a.hp/a.mhp,rb=b.hp/b.mhp;D.winner=ra===rb?-1:ra>rb?0:1;D.timeout=true;return true;}
 D.turn=1-who;startTurn(D);return true;}
function view(D,who){const me=D.p[who],op=D.p[1-who];
 const pub=p=>({hp:p.hp,mhp:p.mhp,blk:p.blk,str:p.str,weak:p.weak,vuln:p.vuln,pw:p.pw,energy:p.energy});
 return {me:{...pub(me),hand:me.hand.map(c=>c.id),drawN:me.draw.length,discN:me.disc.length,exhN:me.exh.length},
  op:{...pub(op),handN:op.hand.length,drawN:op.draw.length,discN:op.disc.length},
  mine:D.turn===who,round:D.round,left:Math.max(0,Math.ceil((D.deadline-Date.now())/1000)),last:D.last?{by:D.last.by===who?'me':'op',id:D.last.id}:null};}
module.exports={newDuel,play,endTurn,view,draftOptions,evoFx,TURN_MS,HP};
