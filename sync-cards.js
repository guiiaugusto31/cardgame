// regenera cards.js a partir de public/index.html
const fs=require('fs');const s=fs.readFileSync(__dirname+'/public/index.html','utf8');
const defs=s.match(/^def\('.*$/gm);const cls=s.match(/const CLS=\{[\s\S]*?\n\};/)[0];const evo=s.match(/const EVO=\{[\s\S]*?\n\};/)[0];
fs.writeFileSync(__dirname+'/cards.js',"'use strict';\nconst CARDS={};\nfunction def(id,name,cost,type,rar,cls,p,up){CARDS[id]={id,name,cost,type,rar,cls,...p,up:up||{}};}\n"+defs.join('\n')+'\n'+cls+'\n'+evo+'\nmodule.exports={CARDS,CLS,EVO};\n');
