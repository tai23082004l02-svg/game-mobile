// Original vector artwork. Run from any directory: node tools/build-frontier-assets.mjs
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
const out=join(dirname(fileURLToPath(import.meta.url)),'../public/stick-frontier/assets');
await mkdir(out,{recursive:true});
const TYPES=['miner','sword','bow','shield','spear','mage'];
const STATES=['idle','run','attack','skill','hit','death'];
const FRAMES=8,SIZE=128;
const svg=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
const line=(d,c='#152c39',w=5)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const path=(d,c,s='none',w=1)=>`<path d="${d}" fill="${c}" stroke="${s}" stroke-width="${w}" stroke-linejoin="round"/>`;
const circle=(x,y,r,c,s='none',w=1)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${s}" stroke-width="${w}"/>`;
const n=x=>Number(x.toFixed(2));
function warrior(type,team,state,f,fit=.72){
 const t=f/7,p=team?'#ffb993':'#b9f6dd',mid=team?'#99565a':'#428f88',dark=team?'#533e4a':'#265562',gold='#edc77a',ink='#142835',metal='#d9e8de';
 const run=state==='run',attack=state==='attack'||state==='skill',skill=state==='skill';
 const swing=Math.sin(t*Math.PI),stride=run?Math.sin(t*Math.PI*2)*14:Math.sin(t*2*Math.PI)*1.4;
 const bob=run?-Math.abs(stride)*.13:Math.sin(t*Math.PI*2)*1.2;
 const lean=attack?swing*7:state==='hit'?-swing*8:0;
 const arm=attack?swing*19:0;
 let body=`<ellipse cx="64" cy="115" rx="22" ry="4" fill="#0c2228" opacity=".16"/>`;
 const death=state==='death',rot=death?t*88:0,opacity=death?1-t*.7:1;
 body+=`<g transform="translate(64 112) scale(${fit}) translate(-64 -112)"><g opacity="${n(opacity)}" transform="translate(64 ${death?64:112}) rotate(${n(rot)}) translate(-64 -${death?64:112})"><g transform="translate(${n(lean)} ${n(bob)})">`;
 if(skill)body+=`<ellipse cx="64" cy="111" rx="${24+swing*9}" ry="8" fill="none" stroke="${p}" stroke-width="2" opacity="${swing}"/>`;
 // Flowing cape is behind the body and responds to the run cycle.
 if(type!=='miner')body+=path(`M57 48 Q${35-stride*.3} 67 ${32-stride*.4} 91 L54 86 L67 51Z`,dark,p,.7)+path('M56 51L45 82L53 76Z',mid);
 body+=line(`M60 85L${56-stride*.6} 99L${50-stride} 112`,ink,7)+line(`M67 85L${71+stride*.6} 100L${79+stride} 112`,ink,7);
 body+=line(`M${46-stride} 113h10`,dark,6)+line(`M${76+stride} 113h9`,dark,6);
 body+=line('M62 54L64 85',ink,11);
 body+=path('M53 53L72 52L77 74L68 87L55 83L51 65Z',mid,ink,2);
 body+=path('M55 54L62 61L70 54L72 71L63 76L54 71Z',dark,p,1.2);
 body+=line('M53 77L72 78',gold,3)+circle(63,78,2,gold);
 body+=circle(62,39,12,ink)+path('M50 36Q52 21 64 23Q76 24 76 37L68 33L54 37Z',dark,p,1.4);
 body+=path('M51 30L57 22L69 22L75 31L65 28Z',mid)+line('M67 38L72 37',p,2.4);
 body+=path('M50 49L57 48L61 55L53 61L46 56Z',metal,ink,1.4)+path('M69 48L77 49L80 56L71 60L66 54Z',metal,ink,1.4);
 if(type==='miner'){
  body+=path('M49 33Q49 19 62 20Q76 20 77 33Z',gold,ink,2)+line('M47 33h31',gold,4)+circle(66,25,4,'#fff2ba',mid,2);
  body+=path('M53 58L69 58L71 77L54 77Z','#a98455')+line('M58 58v18',gold,2);
  body+=line(`M56 58L${66+arm*.4} 68L${80+arm*.4} ${49-arm*.5}`,ink,6);
  const angle=attack?-55+swing*100:-15;
  body+=`<g transform="rotate(${angle} 81 55)">${line('M78 76L83 28','#ae8556',4)}${path('M64 31Q82 17 103 32L103 38Q85 28 64 37Z',metal,ink,1.5)}</g>`;
  body+=path('M43 67L51 67L51 82L40 82Z',dark,gold,1);
 }else if(type==='sword'){
  body+=line(`M71 57L${83+arm*.35} 68L${88+arm*.5} ${57-arm*.3}`,ink,6);
  const angle=attack?-55+swing*110:0;
  body+=`<g transform="rotate(${angle} 87 61)">${path('M84 59L87 20L92 13L95 22L90 59Z',metal,p,1.1)}${line('M79 60h17',gold,3)}${line('M87 61v11',dark,4)}${path('M88 23L89 54L92 24Z','#ffffffa0')}</g>`;
  body+=line('M54 59L42 72L47 81',ink,5);
 }else if(type==='bow'){
  body+=path('M49 36Q47 20 62 19Q78 23 78 39L69 33L53 40Z',dark,p,1.5)+path('M48 29L39 35L51 36Z',mid);
  body+=path('M42 52L48 49L57 78L49 82Z','#9d7754',gold,1)+line('M44 52L40 37M48 52L44 35M52 51L50 35',metal,1.5);
  body+=line(`M70 57L${88-swing*4} 57`,ink,6)+line(`M55 57L${71-swing*15} 58L${82-swing*15} 52`,ink,5);
  body+=`<path d="M90 26Q115 57 90 87" fill="none" stroke="${gold}" stroke-width="3"/>`+line(`M90 26L${91-swing*19} 57L90 87`,p,1);
  if(!attack||f<5)body+=line(`M${74-swing*12} 57L111 57`,metal,2)+path('M112 57L105 54L105 60Z',metal);
 }else if(type==='shield'){
  body+=path('M48 34Q46 18 63 18Q79 18 78 35L70 30L70 45L59 47L49 41Z',metal,ink,2)+path('M60 18L64 9L69 18Z',gold)+line('M68 34h7',ink,3);
  body+=line('M51 58L38 62L36 44',ink,6)+line('M36 77L36 24',metal,4)+path('M30 24L36 12L42 24Z',metal,mid,1);
  body+=`<g transform="translate(${n(swing*6)} 0)">${line('M71 58L88 64',ink,6)}${path('M75 48L105 48L105 77L90 91L75 77Z',dark,p,2)}${path('M80 53L100 53L100 74L90 84L80 74Z',mid,gold,1)}${line('M90 56v22M84 64h12',p,2)}</g>`;
 }else if(type==='spear'){
  body+=path('M52 29L58 18L71 21L76 31L65 27Z',metal,ink,1.5)+path('M58 19L50 9L65 19Z',mid,p,1);
  body+=line(`M70 57L${81+arm*.4} 64L${88+arm*.4} 55`,ink,6)+line('M54 60L66 70L81 68',ink,5);
  body+=`<g transform="rotate(${attack?75-swing*70:67} 83 62) translate(${n(swing*7)} 0)">${line('M82 101L84 26','#b99964',4)}${path('M78 29L84 18L90 29L84 44Z',metal,p,1)}${path('M85 41L97 46L86 56Z',mid)}</g>`;
 }else if(type==='mage'){
  body+=path('M52 57L72 57L83 103Q66 114 44 104Z',dark,p,1.3)+path('M63 62L72 102L56 102Z',mid)+path('M47 36L58 8L71 27L81 37L65 30Z',dark,p,1.4)+line('M60 19L66 23',gold,2);
  body+=line(`M72 58L${87+arm*.2} 62L90 51`,ink,5)+line('M90 108L92 28',gold,3);
  body+=path('M84 27L92 15L101 27L93 39Z',p,metal,1)+circle(92,27,4,'#f0ffff');
  body+=line(`M54 60L${43-arm*.3} 68L${38-arm*.2} ${54-arm*.4}`,ink,5);
  if(skill||attack)body+=circle(35-arm*.2,48-arm*.4,4+swing*7,p)+circle(35-arm*.2,48-arm*.4,2+swing*4,'#fff7df');
 }
 if(skill&&type==='sword')body+=`<path d="M86 28Q131 61 87 94" fill="none" stroke="${p}" stroke-width="4" opacity="${swing}"/>`;
 if(state==='hit')body+=path('M60 45L72 57L63 61L72 72L55 62L61 58L50 48Z','#fff7bf','none');
 body+='</g></g></g>';return body;
}
const manifest={version:2,frame:{width:SIZE,height:SIZE,pivot:[64,112]},framesPerState:FRAMES,artScale:.72,deathDrop:.273,states:STATES,fps:{idle:6,run:12,attack:14,skill:14,hit:18,death:10},units:{},effects:{},icons:{},environment:{}};
for(const type of TYPES){manifest.units[type]={};for(let team=0;team<2;team++){
 let body='';for(let row=0;row<STATES.length;row++)for(let f=0;f<FRAMES;f++)body+=`<svg x="${f*SIZE}" y="${row*SIZE}" width="128" height="128" viewBox="0 0 128 128" overflow="hidden">${warrior(type,team,STATES[row],f)}</svg>`;
 const file=`${type}-${team?'ember':'jade'}.svg`;await writeFile(join(out,file),svg(SIZE*FRAMES,SIZE*STATES.length,body));manifest.units[type][team?'ember':'jade']=file;
}}
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
 if(TYPES.includes(name))return `<g transform="translate(-5 -1) scale(.56)">${warrior(name,0,'idle',0,1)}</g>`;
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
for(const type of TYPES)await writeFile(join(out,`portrait-${type}.svg`),svg(128,128,`<defs><radialGradient id="g"><stop stop-color="#315c60"/><stop offset="1" stop-color="#142b36"/></radialGradient></defs><rect width="128" height="128" rx="24" fill="url(#g)"/><circle cx="64" cy="64" r="53" fill="none" stroke="#d8bf7a" stroke-opacity=".35"/>${warrior(type,0,'idle',0,1)}`));
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
await writeFile(join(out,'ART-LICENSE.txt'),'Original artwork for Vệ Binh Biên Giới, created for the owner of tai23082004l02-svg/game-mobile. Commercial use, modification and distribution in this game are permitted. Vector sources: tools/build-frontier-assets.mjs. AI-generated cover: frontier-cover.png. No third-party game sprites are included. Fonts use the device system font.\n');
console.log('Built 12 character atlases × 48 frames, 12 effect animations, 16 icons, 6 portraits, 4 terrains, props and manifest.');
