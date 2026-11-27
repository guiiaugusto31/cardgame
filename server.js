'use strict';
/* Masmorra dos Ecos — servidor de salas (HTTP + WebSocket na mesma porta) */
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const {WebSocketServer}=require('ws');
const PORT=process.env.PORT||8080;
const DATA_FILE=process.env.DATA_FILE||path.join(__dirname,'data.json');
const MAX_ROOM=10;
let DB={players:{}};
try{DB=JSON.parse(fs.readFileSync(DATA_FILE,'utf8'));}catch(e){}
let dirty=false;
const save=()=>{if(!dirty)return;dirty=false;try{fs.writeFileSync(DATA_FILE+'.tmp',JSON.stringify(DB));fs.renameSync(DATA_FILE+'.tmp',DATA_FILE);}catch(e){console.error('save',e.message);}};
setInterval(save,5000);process.on('SIGTERM',()=>{save();process.exit(0);});
const touch=()=>{dirty=true;};

/* dificuldade conforme o tamanho da sala */
const diff=n=>({n,hp:+(1+.12*(n-1)).toFixed(2),dm:+(1+.05*(n-1)).toFixed(2),gold:+(1+.10*(n-1)).toFixed(2)});

const rooms=new Map();let nextId=1;
const rnd=n=>Math.floor(Math.random()*n);
const CODE='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode=()=>{let c;do{c=Array.from({length:4},()=>CODE[rnd(CODE.length)]).join('');}while(rooms.has(c));return c;};
const rank=m=>m.ch*1000+m.room;

function pubRoom(r){const act=[...r.members.values()].filter(m=>m.state==='play');
 const rear=act.length?act.reduce((a,b)=>rank(a)<=rank(b)?a:b):null;
 return {code:r.code,mode:r.mode,max:MAX_ROOM,host:r.host,started:r.started,diff:diff(Math.max(1,r.members.size)),
  party:rear?{ch:rear.ch,room:rear.room,by:rear.id}:(r.members.size?{ch:Math.max(...[...r.members.values()].map(m=>m.ch)),room:0,by:null}:{ch:0,room:0,by:null}),
  members:[...r.members.values()].map(m=>({id:m.id,name:m.name,hero:m.hero,state:m.state,ch:m.ch,room:m.room,hp:m.hp,mhp:m.mhp,ready:m.ready}))};}
const send=(ws,o)=>{if(ws.readyState===1)ws.send(JSON.stringify(o));};
function releaseGates(r){const act=[...r.members.values()].filter(x=>x.state==='play');
 act.forEach(x=>{if(!x.wait)return;if(act.every(y=>rank(y)>=rank(x))){x.wait=false;send(x.ws,{t:'go'});}});}
function encFire(r,E){if(E.tm){clearTimeout(E.tm);E.tm=null;}E.ended.clear();E.mem.forEach(x=>{const o=r.members.get(x);if(o)send(o.ws,{t:'cphase'});});}
function encCheck(r,E){if(E.mem.size&&[...E.mem].every(x=>E.ended.has(x)))encFire(r,E);}
function encLeave(r,me,id){if(!me||!me.enc)return;const E=r.enc&&r.enc.get(me.enc);if(E){E.mem.delete(id);E.ended.delete(id);E.mem.forEach(x=>{const o=r.members.get(x);if(o)send(o.ws,{t:'cmate',name:me.name,on:false});});encCheck(r,E);}me.enc=null;}
function bcast(r){const p=pubRoom(r);r.members.forEach(m=>send(m.ws,{t:'room',room:p}));}
function leave(c){const r=c.room&&rooms.get(c.room);if(!r)return;r.members.delete(c.id);c.room=null;
 if(!r.members.size){rooms.delete(r.code);return;}
 if(r.host===c.id)r.host=[...r.members.keys()][0];
 checkEnd(r);bcast(r);}
function checkEnd(r){if(!r.started)return;const ms=[...r.members.values()];
 if(ms.length&&ms.every(m=>m.state==='dead'||m.state==='done')){r.ended=true;r.members.forEach(m=>send(m.ws,{t:'end',won:ms.some(x=>x.state==='done')}));}}

const DUEL=require('./duel.js');const {CLS:HCLS,EVO:HEVO}=require('./cards.js');const HR=h=>HCLS[h]?h:'g';
const S=c=>{const P=DB.players[c.tok];return (c.ch&&P.chars&&P.chars[c.ch])||P;};
const HE=(c,h)=>{const s=S(c);return s.k&&HCLS[s.k]?s.k:HR(h);};
const queue=[];const matches=new Set();
const Kf=P=>((P.wins||0)+(P.losses||0)+(P.draws||0))<10?40:24;
function mSend(M,fn){M.pl.forEach((x,i)=>send(x.c.ws,fn(i)));}
function startDraft(M){M.round=0;nextDraft(M);}
function nextDraft(M){if(M.round>=5)return startDuel(M);M.round++;M.dl=Date.now()+25000;
 M.pl.forEach(x=>{x.opts=DUEL.draftOptions(x.hero,x.evo);x.pick=null;send(x.c.ws,{t:'draft',round:M.round,total:5,opts:x.opts,picks:x.picks,left:25});});}
function doPick(M,x,i){if(x.pick!==null)return;i=i|0;if(i<0||i>2)i=rnd(3);x.pick=i;x.picks.push(x.opts[i]);if(M.pl.every(y=>y.pick!==null))nextDraft(M);else send(x.c.ws,{t:'draftwait'});}
function startDuel(M){M.phase='duel';M.D=DUEL.newDuel(M.pl[0],M.pl[1]);pushDuel(M);}
function pushDuel(M){if(M.D.over)return finish(M,M.D.winner,M.D.timeout?'timeout':'ko');mSend(M,i=>({t:'duel',v:DUEL.view(M.D,i)}));}
function finish(M,win,reason){if(M.phase==='end')return;M.phase='end';matches.delete(M);
 if(M.T){M.pl.forEach((x,i)=>{x.c.match=null;const o=M.pl[1-i];send(x.c.ws,{t:'duelend',tour:true,win:win===-1?.5:win===i?1:0,delta:0,elo:S(x.c).elo,reason,op:{name:S(o.c).name,elo:S(o.c).elo}});});return tourAdvance(M.T,M,win);}
 const [a,b]=M.pl;const Pa=S(a.c),Pb=S(b.c);const Ea=1/(1+Math.pow(10,(Pb.elo-Pa.elo)/400));
 const Sa=win===0?1:win===1?0:.5;const da=Math.round(Kf(Pa)*(Sa-Ea)),db=Math.round(Kf(Pb)*((1-Sa)-(1-Ea)));
 const oa=Pa.elo,ob=Pb.elo;Pa.elo=Math.max(0,Pa.elo+da);Pb.elo=Math.max(0,Pb.elo+db);
 if(win===0){Pa.wins++;Pb.losses++;}else if(win===1){Pb.wins++;Pa.losses++;}else{Pa.draws=(Pa.draws||0)+1;Pb.draws=(Pb.draws||0)+1;}touch();
 [[a,b,Pa,Pb,0,da],[b,a,Pb,Pa,1,db]].forEach(([x,y,Px,Py,i,d])=>{x.c.match=null;send(x.c.ws,{t:'duelend',win:win===-1?.5:win===i?1:0,delta:d,elo:Px.elo,reason,op:{name:Py.name,elo:Py.elo}});});}
function matchTick(){const now=Date.now();
 for(let i=0;i<queue.length;i++){const A=queue[i];const wa=(now-A.since)/1000;
  for(let j=i+1;j<queue.length;j++){const B=queue[j];if(A.c.tok===B.c.tok)continue;const w=Math.max(wa,(now-B.since)/1000);
   const win=Math.min(1000,100+50*Math.floor(w/10));if(Math.abs(S(A.c).elo-S(B.c).elo)<=win){
    queue.splice(j,1);queue.splice(i,1);const M={id:nextId++,phase:'draft',pl:[{c:A.c,hero:A.hero,evo:A.evo,picks:[]},{c:B.c,hero:B.hero,evo:B.evo,picks:[]}]};matches.add(M);A.c.match=M;B.c.match=M;
    M.pl.forEach((x,k)=>{const o=M.pl[1-k];const Po=S(o.c);send(x.c.ws,{t:'match',you:k,hero:x.hero,op:{name:Po.name,elo:Po.elo,hero:o.hero,evo:o.evo}});});
    startDraft(M);return matchTick();}}}}
setInterval(matchTick,2000);
setInterval(()=>{const now=Date.now();matches.forEach(M=>{if(M.phase==='draft'&&now>M.dl){M.pl.forEach(x=>{if(x.pick===null)doPick(M,x,rnd(3));});}
 else if(M.phase==='duel'&&now>M.D.deadline){DUEL.endTurn(M.D,M.D.turn);pushDuel(M);}
 else if(M.phase==='duel'){mSend(M,i=>({t:'tick',left:Math.max(0,Math.ceil((M.D.deadline-now)/1000))}));}});},1000);

/* ===== TORNEIO (chave eliminatória 1x1) ===== */
const tours=new Map();
const shuf=a=>{for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
const tname=(T,id)=>{const p=T.players.find(x=>x.c.id===id);return p?p.c.name:'?';};
function pubT(T){return {code:T.code,host:T.host,state:T.state,round:T.round,champion:T.champion?tname(T,T.champion):null,
 players:T.players.map(p=>({id:p.c.id,name:p.c.name,hero:p.hero,out:p.out})),
 rounds:T.rounds.map(R=>R.map(m=>({a:tname(T,m.a),b:m.b?tname(T,m.b):null,w:m.w})))};}
function bcastT(T){const p=pubT(T);T.players.forEach(x=>send(x.c.ws,{t:'tstate',tour:p}));}
function mkMatch(T,rec){const A=T.players.find(x=>x.c.id===rec.a),B=T.players.find(x=>x.c.id===rec.b);
 const M={id:nextId++,phase:'draft',T,rec,pl:[{c:A.c,hero:A.hero,evo:A.evo,picks:[]},{c:B.c,hero:B.hero,evo:B.evo,picks:[]}]};matches.add(M);A.c.match=M;B.c.match=M;
 M.pl.forEach((x,k)=>{const o=M.pl[1-k];const Po=S(o.c);send(x.c.ws,{t:'match',you:k,hero:x.hero,tour:true,op:{name:Po.name,elo:Po.elo,hero:o.hero,evo:o.evo}});});startDraft(M);}
function nextRound(T){if(T.state!=='run')return;const alive=T.players.filter(p=>!p.out);if(alive.length<=1){return endT(T);}
 T.round++;const ids=alive.map(p=>p.c.id);const R=[];for(let i=0;i<ids.length;i+=2){R.push(ids[i+1]?{a:ids[i],b:ids[i+1],w:null}:{a:ids[i],b:null,w:'bye'});}
 T.rounds.push(R);bcastT(T);R.forEach(m=>{if(m.b)mkMatch(T,m);});}
function endT(T){const w=T.players.find(p=>!p.out);T.state='done';T.champion=w?w.c.id:null;bcastT(T);}
function roundDone(T){const R=T.rounds[T.rounds.length-1];return R&&R.every(m=>m.w!==null);}
function tourAdvance(T,M,win){if(T.state!=='run')return;const rec=M.rec;
 if(win===-1){return setTimeout(()=>{if(T.state==='run'&&rec.w===null&&T.players.find(p=>p.c.id===rec.a&&!p.out)&&T.players.find(p=>p.c.id===rec.b&&!p.out))mkMatch(T,rec);},2500);}
 rec.w=win;const loser=win===0?rec.b:rec.a;const lp=T.players.find(p=>p.c.id===loser);if(lp)lp.out=true;bcastT(T);
 if(roundDone(T)){const alive=T.players.filter(p=>!p.out);if(alive.length<=1)endT(T);else setTimeout(()=>nextRound(T),4000);}}
function tourDrop(c){const T=c.tour&&tours.get(c.tour);if(!T)return;c.tour=null;
 if(T.state==='lobby'){T.players=T.players.filter(p=>p.c!==c);if(!T.players.length){tours.delete(T.code);return;}if(T.host===c.id)T.host=T.players[0].c.id;bcastT(T);return;}
 if(T.state==='run'){const p=T.players.find(x=>x.c===c);if(p&&!p.out){p.out=true;
  const R=T.rounds[T.rounds.length-1];const rec=R&&R.find(m=>m.w===null&&(m.a===c.id||m.b===c.id));
  if(rec&&!c.match){rec.w=rec.a===c.id?1:0;}
  bcastT(T);if(!c.match&&roundDone(T)){const alive=T.players.filter(x=>!x.out);if(alive.length<=1)endT(T);else setTimeout(()=>nextRound(T),4000);}}}}
function tourMsg(c,m,ws){
 if(m.t==='tcreate'){if(c.room||c.match||queue.some(q=>q.c===c))return;tourDrop(c);let code;do{code=newCode();}while(tours.has(code)||rooms.has(code));
  const T={code,host:c.id,state:'lobby',round:0,rounds:[],champion:null,players:[{c,hero:HE(c,m.hero),evo:S(c).evo,out:false}]};tours.set(code,T);c.tour=code;bcastT(T);return true;}
 if(m.t==='tjoin'){if(c.room||c.match)return;const T=tours.get(String(m.code||'').toUpperCase().trim());if(!T)return send(ws,{t:'error',key:'tour_notfound'}),true;
  if(T.state!=='lobby')return send(ws,{t:'error',key:'tour_started'}),true;if(T.players.length>=16)return send(ws,{t:'error',key:'tour_full'}),true;
  tourDrop(c);T.players.push({c,hero:HE(c,m.hero),evo:S(c).evo,out:false});c.tour=T.code;bcastT(T);return true;}
 const T=c.tour&&tours.get(c.tour);if(!T)return false;
 if(m.t==='thero'&&T.state==='lobby'){const p=T.players.find(x=>x.c===c);if(p){p.hero=HE(c,m.hero);bcastT(T);}return true;}
 if(m.t==='tstart'&&T.state==='lobby'&&T.host===c.id){if(T.players.length<2)return send(ws,{t:'error',key:'tour_min'}),true;shuf(T.players);T.state='run';nextRound(T);return true;}
 if(m.t==='tleave'){if(c.match)return true;tourDrop(c);send(ws,{t:'tleft'});return true;}
 return false;}
const clients=new Map();
function hello(ws,msg){let tok=msg.token;let p=tok&&DB.players[tok];
 if(!p){tok=crypto.randomBytes(12).toString('hex');p=DB.players[tok]={name:'',elo:1000,wins:0,losses:0,camp:{best:0,wins:0},draws:0};}
 let name=String(msg.name||'Jogador').replace(/[<>&"']/g,'').trim().slice(0,16)||'Jogador';
 const taken=Object.entries(DB.players).some(([k,v])=>k!==tok&&v.name===name);if(taken)name=name+'#'+(1000+rnd(9000));
 p.name=name;touch();return {tok,p};}

const zlib=require('zlib');
let IDX=null;
function loadIdx(){const f=[path.join(__dirname,'public','index.html'),path.join(__dirname,'..','torre','index.html')].find(x=>fs.existsSync(x));if(!f)return null;
 const st=fs.statSync(f);if(IDX&&IDX.f===f&&IDX.m===st.mtimeMs)return IDX;
 const raw=fs.readFileSync(f);const etag='"'+crypto.createHash('sha1').update(raw).digest('hex').slice(0,16)+'"';
 IDX={f,m:st.mtimeMs,raw,etag,gz:zlib.gzipSync(raw,{level:6}),br:null};
 const me=IDX;zlib.brotliCompress(raw,{params:{[zlib.constants.BROTLI_PARAM_QUALITY]:5,[zlib.constants.BROTLI_PARAM_SIZE_HINT]:raw.length}},(e,b)=>{if(!e)me.br=b;});return IDX;}
const MANIFEST=JSON.stringify({name:'Masmorra dos Ecos',short_name:'Masmorra',start_url:'/',display:'fullscreen',orientation:'any',background_color:'#07090f',theme_color:'#0a0c16',icons:[{src:'/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/icon-512.png',sizes:'512x512',type:'image/png'}]});
const server=http.createServer((req,res)=>{
 if(req.url==='/health'){res.end('ok');return;}
 if(req.url==='/manifest.webmanifest'){res.writeHead(200,{'Content-Type':'application/manifest+json','Cache-Control':'public, max-age=3600'});res.end(MANIFEST);return;}
 if(req.url==='/icon-192.png'||req.url==='/icon-512.png'){const f=path.join(__dirname,'public',req.url.slice(1));if(!fs.existsSync(f)){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':'image/png','Cache-Control':'public, max-age=86400'});fs.createReadStream(f).pipe(res);return;}
 {const mm=/^\/music\/([a-z]+)\.mp3(\?.*)?$/.exec(req.url);if(mm){const f=path.join(__dirname,'public','music',mm[1]+'.mp3');if(!fs.existsSync(f)){res.writeHead(404);res.end();return;}
  const sz=fs.statSync(f).size,h={'Content-Type':'audio/mpeg','Accept-Ranges':'bytes','Cache-Control':'public, max-age=604800'},rg=/^bytes=(\d*)-(\d*)$/.exec(String(req.headers.range||''));
  if(rg){let a=rg[1]===''?sz-Number(rg[2]):Number(rg[1]),b=rg[1]===''||rg[2]===''?sz-1:Math.min(Number(rg[2]),sz-1);if(!(a>=0&&a<=b)){res.writeHead(416,{'Content-Range':'bytes */'+sz});res.end();return;}
   res.writeHead(206,{...h,'Content-Range':`bytes ${a}-${b}/${sz}`,'Content-Length':b-a+1});fs.createReadStream(f,{start:a,end:b}).pipe(res);return;}
  res.writeHead(200,{...h,'Content-Length':sz});fs.createReadStream(f).pipe(res);return;}}
 if(req.url==='/'||req.url.startsWith('/?')||req.url==='/index.html'){
  const I=loadIdx();if(!I){res.writeHead(404);res.end('index.html não encontrado');return;}
  const h={'Content-Type':'text/html; charset=utf-8','ETag':I.etag,'Cache-Control':'no-cache','Vary':'Accept-Encoding'};
  if(req.headers['if-none-match']===I.etag){res.writeHead(304,h);res.end();return;}
  const ae=String(req.headers['accept-encoding']||'');let body=I.raw;
  if(/\bbr\b/.test(ae)&&I.br){h['Content-Encoding']='br';body=I.br;}else if(/\bgzip\b/.test(ae)){h['Content-Encoding']='gzip';body=I.gz;}
  h['Content-Length']=body.length;res.writeHead(200,h);res.end(body);return;}
 res.writeHead(404);res.end('not found');});
const wss=new WebSocketServer({server,maxPayload:16*1024});

wss.on('connection',ws=>{
 const c={id:'p'+(nextId++),ws,room:null,tok:null,alive:true};clients.set(ws,c);
 ws.on('pong',()=>{c.alive=true;});
 let last=0,burst=0;
 ws.on('message',raw=>{
  const now=Date.now();if(now-last<40){if(++burst>30){ws.close();return;}}else burst=0;last=now;
  let m;try{m=JSON.parse(raw);}catch(e){return;}
  if(!m||typeof m.t!=='string')return;
  if(m.t==='hello'){const {tok,p}=hello(ws,m);c.tok=tok;c.ch=null;c.name=p.name;send(ws,{t:'welcome',id:c.id,token:tok,name:p.name,elo:p.elo,wins:p.wins,losses:p.losses,camp:p.camp});return;}
  if(!c.tok)return;const P=DB.players[c.tok];
  if(m.t==='char'||m.t==='chardel'){const busy=c.room||c.match||c.tour||queue.some(q=>q.c===c);
   const id=String(m.id||'').replace(/[^a-z0-9]/gi,'').slice(0,12);if(!id)return;P.chars=P.chars||{};
   if(m.t==='chardel'){if(busy&&c.ch===id)return;delete P.chars[id];if(c.ch===id){c.ch=null;c.name=P.name;}touch();return;}
   if(busy&&c.ch!==id)return send(ws,{t:'error',key:'char_busy'});
   let ch=P.chars[id];if(!ch){if(Object.keys(P.chars).length>=8)return send(ws,{t:'error',key:'chars_full'});ch=P.chars[id]={id,elo:1000,wins:0,losses:0,draws:0,best:0};}
   if(!busy||!ch.k){const k=HR(m.k);ch.k=k;let t=Math.max(0,Math.min(3,(m.evo&&m.evo.t)|0)),tr=m.evo&&m.evo.trail;if(!(HEVO[k]&&HEVO[k].trails&&HEVO[k].trails[tr]))tr=null;if(t>=2&&!tr)t=1;ch.evo={t,trail:t>=2?tr:null};}
   ch.name=String(m.name||'Herói').replace(/[<>&"']/g,'').trim().slice(0,16)||'Herói';ch.best=Math.max(ch.best||0,Math.min(6,m.best|0));
   c.ch=id;c.name=ch.name;touch();send(ws,{t:'charok',id,name:ch.name,k:ch.k,evo:ch.evo,elo:ch.elo,wins:ch.wins,losses:ch.losses});return;}
  if(m.t==='rank'){const list=[];Object.values(DB.players).forEach(x=>{const cs=Object.values(x.chars||{});if(cs.length)cs.forEach(q=>list.push({name:q.name,k:q.k,evo:(q.evo&&q.evo.t)||0,elo:q.elo,wins:q.wins,losses:q.losses,camp:{best:q.best||0},owner:x.name}));else if(x.name)list.push({name:x.name,elo:x.elo,wins:x.wins,losses:x.losses,camp:x.camp});});
   list.sort((a,b)=>b.elo-a.elo);send(ws,{t:'rank',list:list.slice(0,30)});return;}
  if(typeof m.t==='string'&&m.t[0]==='t'&&m.t!=='t'&&tourMsg(c,m,ws))return;
  if(m.t==='queue'){if(c.room||c.match||c.tour||queue.some(q=>q.c===c))return;queue.push({c,hero:HE(c,m.hero),evo:S(c).evo,since:Date.now()});send(ws,{t:'queued'});return;}
  if(m.t==='unqueue'){const k=queue.findIndex(q=>q.c===c);if(k>=0)queue.splice(k,1);send(ws,{t:'unqueued'});return;}
  if(c.match){const M=c.match,idx=M.pl.findIndex(x=>x.c===c),x=M.pl[idx];
   if(m.t==='pick'&&M.phase==='draft')doPick(M,x,m.i);
   else if(M.phase==='duel'){if(m.t==='play'){if(DUEL.play(M.D,idx,m.i|0))pushDuel(M);}else if(m.t==='endturn'){if(DUEL.endTurn(M.D,idx))pushDuel(M);}else if(m.t==='forfeit')finish(M,1-idx,'forfeit');}
   return;}
  if(m.t==='create'){leave(c);const code=newCode();const r={code,mode:'coop',host:c.id,started:false,members:new Map()};rooms.set(code,r);
   r.members.set(c.id,{id:c.id,ws,name:c.name,hero:HE(c,'g'),state:'lobby',ch:0,room:0,hp:0,mhp:0,ready:false});c.room=code;bcast(r);return;}
  if(m.t==='join'){const code=String(m.code||'').toUpperCase().trim();const r=rooms.get(code);
   if(!r)return send(ws,{t:'error',key:'room_notfound'});if(r.ended)return send(ws,{t:'error',key:'room_started'});if(r.members.size>=MAX_ROOM)return send(ws,{t:'error',key:'room_full'});
   leave(c);r.members.set(c.id,{id:c.id,ws,name:c.name,hero:HE(c,'g'),state:'lobby',ch:0,room:0,hp:0,mhp:0,ready:false});c.room=code;bcast(r);return;}
  const r=c.room&&rooms.get(c.room);if(!r){return;}const me=r.members.get(c.id);if(!me)return;
  if(m.t==='leave'){leave(c);send(ws,{t:'left'});return;}
  if(m.t==='hero'&&(!r.started||me.state==='lobby')){me.hero=HE(c,m.hero);bcast(r);return;}
  if(m.t==='ready'&&!r.started){me.ready=!!m.v;bcast(r);return;}
  if(m.t==='start'&&r.host===c.id&&!r.started){const others=[...r.members.values()].filter(x=>x.id!==c.id);if(others.some(x=>!x.ready))return send(ws,{t:'error',key:'not_ready'});
   r.started=true;r.t0=Date.now();const d=diff(r.members.size);r.d=d;r.members.forEach(x=>{x.state='play';x.ch=0;x.room=0;});
   r.members.forEach(x=>send(x.ws,{t:'started',diff:d,hero:x.hero}));bcast(r);return;}
  if(m.t==='late'&&r.started&&!r.ended&&me.state==='lobby'){const pr=pubRoom(r).party;me.state='play';me.ch=pr.ch;me.room=pr.room;me.hp=0;me.mhp=0;send(ws,{t:'started',diff:r.d||diff(r.members.size),hero:me.hero,at:{ch:pr.ch,room:pr.room}});bcast(r);return;}
  if(!r.started||r.ended)return;
  if(m.t==='gate'&&me.state==='play'){me.ch=Math.max(0,Math.min(20,m.ch|0));me.room=Math.max(0,Math.min(50,m.room|0));me.wait=true;releaseGates(r);bcast(r);return;}
  if(m.t==='cjoin'&&me.state==='play'){const ch=Math.max(0,Math.min(20,m.ch|0)),rm=Math.max(0,Math.min(50,m.room|0));r.enc=r.enc||new Map();const key=ch+'|'+rm;let E=r.enc.get(key);
   if(!E||E.done||![...E.mem].some(x=>r.members.get(x)&&r.members.get(x).state==='play')){E={ids:(Array.isArray(m.ids)?m.ids:[]).slice(0,6).map(String),kind:String(m.kind||'fight'),hp:null,mhp:null,mem:new Set(),pend:new Set(),ended:new Set(),owner:c.id,done:false};r.enc.set(key,E);}
   E.mem.add(c.id);me.enc=key;const mates=[...E.mem].filter(x=>x!==c.id).map(x=>r.members.get(x)).filter(Boolean).map(x=>x.name);
   if(!E.hp&&E.owner!==c.id)E.pend.add(c.id);
   send(ws,{t:'cjoined',ids:E.ids,kind:E.kind,hp:E.hp,mhp:E.mhp,mates});
   E.mem.forEach(x=>{if(x!==c.id){const o=r.members.get(x);if(o)send(o.ws,{t:'cmate',name:me.name,on:true});}});return;}
  if(m.t==='cinit'&&me.enc){const E=r.enc.get(me.enc);if(E&&!E.hp&&Array.isArray(m.hp)){E.hp=m.hp.map(x=>Math.max(0,x|0));E.mhp=(m.mhp||m.hp).map(x=>Math.max(1,x|0));E.pend.forEach(x=>{const o=r.members.get(x);if(o)send(o.ws,{t:'csync',hp:E.hp,mhp:E.mhp});});E.pend.clear();}return;}
  if(m.t==='cblk'&&me.enc){const E=r.enc.get(me.enc);if(!E||E.done)return;const a=Math.max(0,Math.min(60,m.a|0));if(!a)return;E.mem.forEach(x=>{if(x!==c.id){const o=r.members.get(x);if(o)send(o.ws,{t:'cblk',a,from:me.name});}});return;}
  if(m.t==='cdmg'&&me.enc&&Array.isArray(m.d)){const E=r.enc.get(me.enc);if(!E||E.done)return;const d=m.d.slice(0,8).map(x=>Math.max(0,Math.min(250,x|0)));
   if(E.hp)E.hp=E.hp.map((h,i)=>Math.max(0,h-(d[i]||0)));const ar=a=>Array.isArray(a)?a.map(x=>Math.max(0,Math.min(20,x|0))):[];const v=ar(m.v),w=ar(m.w);E.mem.forEach(x=>{if(x!==c.id){const o=r.members.get(x);if(o)send(o.ws,{t:'cdmg',d,v,w,from:me.name});}});
   if(E.hp&&E.hp.every(h=>h<=0))E.done=true;return;}
  if(m.t==='cleave'&&me.enc){encLeave(r,me,c.id);return;}
  if(m.t==='cend'&&me.enc){const E=r.enc.get(me.enc);if(!E||E.done)return;E.ended.add(c.id);if(!E.tm)E.tm=setTimeout(()=>encFire(r,E),45000);encCheck(r,E);return;}
  if(m.t==='progress'&&me.state==='play'){const ch=Math.max(0,Math.min(20,m.ch|0)),rm=Math.max(0,Math.min(50,m.room|0));
   const now2=Date.now(),adv=(ch>me.ch||rm>me.room);
   if(adv){const okStep=(ch===me.ch&&rm-me.room<=2)||(ch===me.ch+1&&rm<=1);if(!okStep||now2-(me.pt||0)<2500)return;me.pt=now2;me.adv=(me.adv||0)+1;me.ch=ch;me.room=rm;}
   else if(ch===me.ch){me.room=rm;}
   me.hp=Math.max(0,Math.min(m.hp|0,m.mhp|0));me.mhp=Math.max(0,Math.min(2000,m.mhp|0));
   if(me.ch+1>P.camp.best){P.camp.best=me.ch+1;touch();}bcast(r);return;}
  if(m.t==='dead'&&me.state==='play'){encLeave(r,me,c.id);me.state='dead';me.hp=0;releaseGates(r);bcast(r);checkEnd(r);return;}
  if(m.t==='done'&&me.state==='play'){if(me.ch<5||(me.adv||0)<10||Date.now()-(r.t0||0)<90000)return;me.state='done';releaseGates(r);P.camp.wins++;P.camp.best=Math.max(P.camp.best,me.ch+1);touch();bcast(r);checkEnd(r);return;}
 });
 ws.on('close',()=>{clients.delete(ws);tourDrop(c);{const k=queue.findIndex(q=>q.c===c);if(k>=0)queue.splice(k,1);if(c.match){const M=c.match,idx=M.pl.findIndex(x=>x.c===c);finish(M,1-idx,'forfeit');}}const r=c.room&&rooms.get(c.room);
  if(r&&r.started){const me=r.members.get(c.id);if(me&&me.state==='play'){encLeave(r,me,c.id);me.state='dead';me.hp=0;}c.room=null;releaseGates(r);if(r.host===c.id){r.host=[...r.members.keys()].find(k=>k!==c.id)||r.host;}
   const alive=[...r.members.values()].filter(x=>x.ws.readyState===1);if(!alive.length){rooms.delete(r.code);return;}bcast(r);checkEnd(r);}
  else leave(c);});
});
setInterval(()=>{wss.clients.forEach(ws=>{const c=clients.get(ws);if(c&&!c.alive){ws.terminate();return;}if(c)c.alive=false;ws.ping();});},20000);
server.listen(PORT,()=>console.log('Masmorra dos Ecos server na porta '+PORT));
module.exports={diff};
