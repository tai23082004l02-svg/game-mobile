// Original vector artwork. Run from any directory: node tools/build-frontier-assets.mjs
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {characterFrame,characterDefs} from './frontier-character-art.mjs';
import {FRAME,FRAMES,STATES,WORK_STATES,PIVOT,PADDING,DURATIONS} from '../public/stick-frontier/character-layout.mjs';
const out=join(dirname(fileURLToPath(import.meta.url)),'../public/stick-frontier/assets');
await mkdir(out,{recursive:true});
const TYPES=['miner','sword','bow','shield','spear','mage'];
const SIZE=FRAME;
const svg=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
const line=(d,c='#152c39',w=5)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const path=(d,c,s='none',w=1)=>`<path d="${d}" fill="${c}" stroke="${s}" stroke-width="${w}" stroke-linejoin="round"/>`;
const circle=(x,y,r,c,s='none',w=1)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${s}" stroke-width="${w}"/>`;
const n=x=>Number(x.toFixed(2));
function warrior(type,team,state,f){return characterFrame(type,team,state,f);}
const manifest={version:3,frame:{width:SIZE,height:SIZE,pivot:PIVOT,padding:PADDING},framesPerState:FRAMES,artScale:.88,deathDrop:0,durations:DURATIONS,states:STATES,fps:Object.fromEntries(STATES.map(s=>[s,FRAMES/DURATIONS[s]])),units:{},effects:{},icons:{},environment:{}};
for(const type of TYPES){manifest.units[type]={};for(let team=0;team<2;team++){
 let body=characterDefs(team);for(let row=0;row<STATES.length;row++)for(let f=0;f<FRAMES;f++)body+=`<svg x="${f*SIZE}" y="${row*SIZE}" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" overflow="hidden">${warrior(type,team,STATES[row],f)}</svg>`;
 const file=`${type}-${team?'ember':'jade'}.svg`;await writeFile(join(out,file),svg(SIZE*FRAMES,SIZE*STATES.length,body));manifest.units[type][team?'ember':'jade']=file;
}}
// Miner work atlas shares the exact same pivot and padding as the combat atlas.
manifest.mining={frames:FRAMES,cycle:DURATIONS.dig,impactFrame:8,frame:[SIZE,SIZE],pivot:PIVOT,files:{jade:'miner-dig-jade.svg',ember:'miner-dig-ember.svg'},mine:'gold-mine.png'};
manifest.worker={states:WORK_STATES,files:{jade:'miner-work-jade.svg',ember:'miner-work-ember.svg'}};
for(let team=0;team<2;team++){
 let body=characterDefs(team),dig=characterDefs(team);
 for(let row=0;row<WORK_STATES.length;row++)for(let f=0;f<FRAMES;f++){
  const cell=`<svg x="${f*SIZE}" y="${row*SIZE}" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" overflow="hidden">${warrior('miner',team,WORK_STATES[row],f)}</svg>`;body+=cell;
  if(row===0)dig+=cell;
 }
 await writeFile(join(out,manifest.worker.files[team?'ember':'jade']),svg(SIZE*FRAMES,SIZE*WORK_STATES.length,body));
 await writeFile(join(out,manifest.mining.files[team?'ember':'jade']),svg(SIZE*FRAMES,SIZE,dig));
}
// Illustration board uses the very same generated poses, with numbered frame borders.
const rowLabels=['ĐỨNG','CHẠY','TẤN CÔNG','KỸ NĂNG','TRÚNG ĐÒN','BỊ HẠ'],names=['THỢ MỎ','KIẾM SĨ','CUNG THỦ','HỘ VỆ','THƯƠNG BINH','PHÁP SƯ'];
let board='<rect width="1240" height="1510" fill="#10252e"/><text x="40" y="47" font-family="sans-serif" font-size="25" font-weight="bold" fill="#edca83">VỆ BINH BIÊN GIỚI / BẢNG MINH HỌA NHÂN VẬT</text><text x="40" y="75" font-family="sans-serif" font-size="14" fill="#b4c8c6">Frame 192 × 192 · Pivot (96,168) · 12 frame / động tác · Khoảng đệm kiểm tra bằng alpha</text>';
for(let c=0;c<TYPES.length;c++)board+=`<text x="${165+c*175}" y="108" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#edca83">${names[c]}</text>`;
for(let row=0;row<6;row++){
 board+=`<text x="20" y="${205+row*190}" font-family="sans-serif" font-size="11" fill="#a9d9cb">${rowLabels[row]}</text>`;
 for(let c=0;c<6;c++){
  let pose=characterDefs(0)+warrior(TYPES[c],0,STATES[row],row===0?0:row===1?3:row===5?11:6);
  for(const id of ['plate','steel','leather','orb'])pose=pose.replaceAll(`id="${id}"`,`id="${id}-${row}-${c}"`).replaceAll(`url(#${id})`,`url(#${id}-${row}-${c})`);
  board+=`<g transform="translate(${80+c*175} ${125+row*190})"><rect width="168" height="168" rx="8" fill="#1b3740" stroke="#39545b"/><g transform="scale(.875)">${pose}</g><path d="M79 147h10M84 142v10" stroke="#efc77a" stroke-width="1"/></g>`;
 }
}
board+='<text x="40" y="1330" font-family="sans-serif" font-size="16" fill="#edca83">THỢ MỎ / ĐÀO → MANG VÀNG → GIAO TẠI TRỤ</text>';
for(let i=0;i<3;i++){let pose=characterDefs(0)+warrior('miner',0,WORK_STATES[i],i===0?8:5);for(const id of ['plate','steel','leather','orb'])pose=pose.replaceAll(`id="${id}"`,`id="${id}-work-${i}"`).replaceAll(`url(#${id})`,`url(#${id}-work-${i})`);board+=`<g transform="translate(${170+i*310} 1335) scale(.8)">${pose}</g>`;}
await writeFile(join(out,'characters-overview.svg'),svg(1240,1510,board));
manifest.overview='characters-overview.svg';
const cuts={meta:{frame:[SIZE,SIZE],pivot:PIVOT,padding:PADDING,trimmed:false},frames:{}};
function addCuts(type,faction,file,states){for(let row=0;row<states.length;row++)for(let f=0;f<FRAMES;f++)cuts.frames[`${type}/${faction}/${states[row]}/${String(f).padStart(2,'0')}`]={atlas:file,frame:{x:f*SIZE,y:row*SIZE,w:SIZE,h:SIZE},rotated:false,trimmed:false,pivot:{x:PIVOT[0]/SIZE,y:PIVOT[1]/SIZE},duration:DURATIONS[states[row]]/FRAMES};}
for(const [type,files] of Object.entries(manifest.units))for(const [faction,file] of Object.entries(files))addCuts(type,faction,file,STATES);
for(const [faction,file] of Object.entries(manifest.worker.files))addCuts('miner',faction,file,WORK_STATES);
await writeFile(join(out,'character-frames.json'),JSON.stringify(cuts)+'\n');manifest.frameMap='character-frames.json';

const FX=['slash','impact','arrow','fireball','blast','heal','rally','barrier','meteor','frost','coin','dust'];
function effect(kind,f){const t=f/7,r=5+t*43,o=n(1-t*.85),c=['fireball','blast','meteor'].includes(kind)?'#ffb36d':['heal','rally','barrier'].includes(kind)?'#a4f3ce':'#d6f8ed';let s='';
 if(kind==='slash')s=`<path d="M${55-t*18} 18Q118 62 ${55-t*18} 109Q94 60 ${55-t*18} 18" fill="${c}" opacity="${o}"/>`;
 else if(kind==='arrow')s=line('M24 64H103',c,3)+path('M106 64L93 59L93 69Z',c)+line('M28 64L20 57M28 64L20 71',c,2);
 else if(kind==='fireball'||kind==='meteor')s=path('M15 40L67 49L98 65L15 94L40 65Z','#f4775566')+circle(81,64,17+t*3,'#e9674d')+circle(85,64,12,'#ffcf7b')+circle(87,62,6,'#fff7d7');
 else if(kind==='barrier')s=path(`M64 ${15-t*2}L104 31V70Q98 96 64 112Q30 96 24 70V31Z`,'#8bebc51f',c,3)+line('M64 36V85M42 60H86',c,4);
 else if(kind==='coin')s=`<g transform="translate(64 64) scale(${.25+Math.abs(Math.cos(t*6))*0.75} 1)">${circle(0,0,20,'#efc76c','#ffedb3',3)}${path('M0 -11L8 0L0 11L-8 0Z','#fff0bb')}</g>`;
 else{for(let i=0;i<8;i++){const a=i*Math.PI/4+(kind==='rally'?t:0),x=64+Math.cos(a)*r,y=64+Math.sin(a)*r;
   if(kind==='heal')s+=line(`M${n(x-4)} ${n(y)}h8M${n(x)} ${n(y-4)}v8`,c,3);
   else if(kind==='frost')s+=line(`M64 64L${n(x)} ${n(y)}M${n(x)} ${n(y)}l-7 1`,c,2);
   else s+=circle(n(x),n(y),Math.max(1,5*(1-t)),c);
  }s+=circle(64,64,r,'none',c,kind==='blast'?5:2);
 }
 return `<g opacity="${o}">${s}</g>`;
}
let fxBody='';FX.forEach((fx,row)=>{manifest.effects[fx]={row,frames:8};for(let f=0;f<8;f++)fxBody+=`<g transform="translate(${f*128} ${row*128})">${effect(fx,f)}</g>`;});await writeFile(join(out,'effects.svg'),svg(1024,FX.length*128,fxBody));
const ICONS=['miner','sword','bow','shield','spear','mage','volley','heal','rally','meteor','gold','attack','defend','retreat','star','pause'];
function icon(name){let s='';const c='#f0ce8a',m='#b2eeda';
 if(TYPES.includes(name))return `<g transform="translate(-6 -7) scale(.4)">${characterDefs(0)}${warrior(name,0,'idle',0)}</g>`;
 if(name==='heal')s=line('M32 17v30M17 32h30',m,6);
 if(name==='rally')s=line('M23 49V14',c,3)+path('M25 15L49 19L39 29L25 27Z',m);
 if(name==='meteor')s=path('M12 10L39 23L49 36L25 49Z','#f68e66')+circle(36,37,11,c)+circle(38,38,5,'#fff6c8');
 if(name==='volley'){for(let i=0;i<3;i++)s+=line(`M${17+i*12} 48L${24+i*12} 16`,m,2)+path(`M${24+i*12} 13L${19+i*12} 21L${27+i*12} 23Z`,c);}
 if(name==='gold')s=circle(32,32,17,c,'#fff0b8',2)+path('M32 20L40 32L32 44L24 32Z','#856c3d');
 if(name==='attack')s=line('M16 48L47 16M16 16L47 48',m,4)+path('M40 15L51 12L48 23Z',c)+path('M13 41L11 52L23 49Z',c);
 if(name==='defend')s=path('M32 12L48 20V37L32 52L16 37V20Z','none',m,3);
 if(name==='retreat')s=line('M48 45V34Q48 25 38 25H15M25 15L15 25L25 35',m,4);
 if(name==='star')s=path('M32 9L39 24L56 26L44 38L47 55L32 47L17 55L20 38L8 26L25 24Z',c);
 if(name==='pause')s=line('M25 17V47M40 17V47',m,5);
 return s;
}
let icons='';for(let i=0;i<ICONS.length;i++){const name=ICONS[i],x=i%8*64,y=Math.floor(i/8)*64;icons+=`<g transform="translate(${x} ${y})">${icon(name)}</g>`;manifest.icons[name]={x,y,width:64,height:64};await writeFile(join(out,`icon-${name}.svg`),svg(64,64,icon(name)));}await writeFile(join(out,'icons.svg'),svg(512,128,icons));
// Portraits are separate from the animation atlas so UI never loads the full sheets.
for(const type of TYPES)await writeFile(join(out,`portrait-${type}.svg`),svg(128,128,`<defs><radialGradient id="g"><stop stop-color="#315c60"/><stop offset="1" stop-color="#142b36"/></radialGradient></defs><rect width="128" height="128" rx="24" fill="url(#g)"/><circle cx="64" cy="64" r="53" fill="none" stroke="#d8bf7a" stroke-opacity=".35"/>${characterDefs(0)}<g transform="scale(.666667)">${warrior(type,0,'idle',0)}</g>`));
// Four parallax scenery sheets, each 1800×480, with consistent ground/pivot.
const regions=[['meadow','#88afb0','#ead8ab','#557e76','#a7b780'],['pass','#9cabb4','#ded4b0','#647b7d','#b8b29a'],['valley','#ae9b99','#edd3a8','#6a7274','#b1ad78'],['citadel','#53677e','#c5a7a0','#3a5261','#858a78']];
for(const [name,sky,horizon,hill,ground] of regions){let body=`<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${horizon}"/></linearGradient></defs><rect width="1800" height="480" fill="url(#sky)"/>${circle(1300,95,40,'#ffe7b7')}`;
 for(let layer=0;layer<3;layer++){let d='M0 400';for(let x=0;x<=1800;x+=40)d+=`L${x} ${n(220+layer*42+Math.sin(x*.008+layer*2)*32+Math.sin(x*.021)*11)}`;d+='L1800 480H0Z';body+=path(d,[horizon,hill,'#345d59'][layer]);}
 for(let i=0;i<30;i++){const x=i*67+12,y=315+Math.sin(i*4)*14;body+=path(`M${x} ${y-48}L${x-12} ${y}H${x+12}Z`,'#2b5553');}
 body+=path('M0 338Q450 325 900 340T1800 338V480H0Z',ground)+path('M0 365Q450 347 900 365T1800 364V426Q900 406 0 426Z','#d1be92');
 for(let i=0;i<130;i++){const x=(i*179+43)%1800,y=342+i*23%131;body+=line(`M${x} ${y}l3 -5l3 5`,'#6b8c623f',1.5);}
 const file=`terrain-${name}.svg`;await writeFile(join(out,file),svg(1800,480,body));manifest.environment[name]=file;
}
let props='';for(let team=0;team<2;team++){const x=team*256,c=team?'#785357':'#345e65',trim=team?'#ffb38c':'#aff0d5';props+=`<g transform="translate(${x} 0)">${path('M45 226L53 88H72V103H89V88H107V103H124V88H143V103H160V88H180L188 226Z',c,'#152d3a',4)}${path('M81 226V161Q116 131 151 161V226Z','#18313c')}${line('M117 89V23',trim,4)}${path('M120 25L178 36L120 58Z',trim)}${line('M57 120H176M54 153H78M154 153H181M49 191H79M153 191H185',trim+'44',2)}</g>`;}
 props+=`<g transform="translate(512 0)">${path('M35 222L49 175L75 160L100 181L132 167L181 225Z','#7a8976','#435e58',3)}${path('M64 202L77 172L90 196L81 213Z','#efca76')}${path('M111 208L126 179L139 199L130 216Z','#ffe0a1')}</g>`;await writeFile(join(out,'props.svg'),svg(768,256,props));
manifest.props={file:'props.svg',cell:[256,256],items:{jadeTower:0,emberTower:1,goldMine:2}};
await writeFile(join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(join(out,'ART-LICENSE.txt'),'Original artwork for Vệ Binh Biên Giới, created for the owner of tai23082004l02-svg/game-mobile. Commercial use, modification and distribution in this game are permitted. Vector sources: tools/build-frontier-assets.mjs. AI-generated illustrations: frontier-cover.png and gold-mine.png. No third-party game sprites are included. Fonts use the device system font.\n');
console.log('Built v3: 12 combat atlases × 72 frames + 2 worker atlases × 36 frames, 936 unique frames, illustration board and manifest.');
