// Original articulated vector character illustrations; canonical coordinates 256×256.
// A fixed per-character transform is shared across every frame, never auto-trimmed.
const n=x=>Number(x.toFixed(2)),lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t),clamp=x=>Math.max(0,Math.min(1,x));
const line=(d,c,w=5)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const shape=(d,c,s='#122a35',w=2)=>`<path d="${d}" fill="${c}" stroke="${s}" stroke-width="${w}" stroke-linejoin="round"/>`;
const circle=(x,y,r,c,s='none',w=1)=>`<circle cx="${n(x)}" cy="${n(y)}" r="${r}" fill="${c}" stroke="${s}" stroke-width="${w}"/>`;
function knee(a,b,length,bend=1){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.max(.01,Math.hypot(dx,dy)),h=Math.sqrt(Math.max(0,length*length-d*d/4));return [(a[0]+b[0])/2+bend*dy/d*h,(a[1]+b[1])/2-bend*dx/d*h];}
export function characterDefs(team=0){const main=team?'#ab5964':'#438f91',light=team?'#efad99':'#a5e9d1';return `<defs><linearGradient id="plate"><stop stop-color="${light}"/><stop offset=".42" stop-color="${main}"/><stop offset="1" stop-color="${team?'#552f45':'#234650'}"/></linearGradient><linearGradient id="steel"><stop stop-color="#f4f2d8"/><stop offset=".4" stop-color="#b5ceca"/><stop offset="1" stop-color="#536e7d"/></linearGradient><linearGradient id="leather"><stop stop-color="#ca9a59"/><stop offset="1" stop-color="#77583d"/></linearGradient><radialGradient id="orb"><stop stop-color="#fffce0"/><stop offset=".4" stop-color="${light}"/><stop offset="1" stop-color="${main}"/></radialGradient></defs>`;}
export function characterFrame(type,team,state,f,frames=12){
 const t=f/Math.max(1,frames-1),phase=f/frames*Math.PI*2,ink='#152b38',edge=team?'#ffbb97':'#b2f1d6',dark=team?'#4b3449':'#233f50',cloth=team?'#843f51':'#2f7779',gold='#e2bf78',metal='url(#steel)',plate='url(#plate)';
 const running=state==='run'||state==='carry',working=state==='dig',carrying=state==='carry',unload=state==='unload',dead=state==='death',skill=state==='skill',attacking=state==='attack'||skill||working;
 const gait=running?Math.sin(phase):0,breathe=Math.sin(phase)*1.4,death=dead?smooth(t):0;
 const hit=state==='hit'?Math.sin(Math.PI*t):0;
 const contact=skill?.62:.43;
 let strike=attacking?smooth(clamp((t-.2)/(contact-.2))):0;const recover=attacking?smooth(clamp((t-contact)/(1-contact))):0;
 const workAngle=[-55,-75,-95,-110,-100,-55,20,80,125,90,20,-20][f];
 const lean=working?Math.sin(t*Math.PI)*7:unload?Math.sin(t*Math.PI)*20:attacking?strike*(1-recover)*8:carrying?5:-hit*12;
 let hip=[128+lean,168+(running?Math.abs(gait)*3:0)+(unload?Math.sin(t*Math.PI)*15:0)];
 let shoulder=[128+lean*1.4,123+(running?Math.abs(gait)*3:breathe)+(unload?Math.sin(t*Math.PI)*25:0)];
 let head=[shoulder[0]-1,shoulder[1]-31];
 if(dead){hip=[lerp(128,111,death),lerp(168,211,death)];shoulder=[lerp(128,145,death),lerp(123,211,death)];head=[lerp(127,168,death),lerp(92,210,death)];}
 const feet=dead?[[lerp(110,67,death),224],[lerp(146,127,death),224]]:[[111+gait*23,224-Math.max(0,-gait)*10],[146-gait*23,224-Math.max(0,gait)*10]];
 let s=`<ellipse cx="128" cy="229" rx="32" ry="5" fill="#0c232b" opacity=".17"/>`;
 const opacity=dead?1-.25*t:1;
 s+=`<g opacity="${n(opacity)}" transform="translate(128 224) scale(.88) translate(-128 -224)">`;
 // Back layer: cape, far leg, far arm, quiver. All stays inside a fixed padded cell.
 if(type!=='miner')s+=shape(`M${n(shoulder[0]-13)} ${n(shoulder[1]-5)} Q${n(shoulder[0]-48-gait*5)} ${n(Math.min(224,shoulder[1]+35))} ${n(hip[0]-42)} ${n(Math.min(224,hip[1]+26))} L${n(hip[0]-8)} ${n(Math.min(224,hip[1]+12))} L${n(shoulder[0]+13)} ${n(shoulder[1]+4)}Z`,dark,edge,1.2)+line(`M${n(shoulder[0]-12)} ${n(shoulder[1]+7)}L${n(hip[0]-30)} ${n(Math.min(224,hip[1]+17))}`,cloth,3);
 for(let i=0;i<2;i++){
  const a=[hip[0]+(i?8:-8),hip[1]],foot=feet[i],k=knee(a,foot,32,i?1:-1);
  s+=line(`M${n(a[0])} ${n(a[1])}L${n(k[0])} ${n(k[1])}L${n(foot[0])} ${n(foot[1]-5)}`,ink,12);
  s+=line(`M${n(k[0])} ${n(k[1]+2)}L${n(foot[0])} ${n(foot[1]-7)}`,i?metal:dark,7);
  s+=circle(k[0],k[1],5,i?plate:dark,ink,1.5);
  s+=shape(`M${n(foot[0]-8)} ${n(foot[1]-9)}L${n(foot[0]+5)} ${n(foot[1]-9)}L${n(foot[0]+12)} ${n(foot[1]-2)}L${n(foot[0]+10)} ${n(foot[1]+2)}H${n(foot[0]-8)}Z`,dark,ink,2);
 }
 const sx=shoulder[0],sy=shoulder[1],hx=hip[0],hy=hip[1];
 s+=shape(`M${n(sx-16)} ${n(sy-5)}L${n(sx+16)} ${n(sy-5)}L${n(hx+19)} ${n(hy-3)}L${n(hx+8)} ${n(hy+12)}L${n(hx-17)} ${n(hy+7)}L${n(sx-20)} ${n(sy+17)}Z`,type==='miner'?'url(#leather)':plate,ink,2.5);
 if(type!=='miner')s+=shape(`M${n(sx-11)} ${n(sy)}L${n(sx)} ${n(sy+8)}L${n(sx+12)} ${n(sy)}L${n(hx+12)} ${n(hy-14)}L${n(hx)} ${n(hy-8)}L${n(hx-13)} ${n(hy-15)}Z`,dark,edge,1.2)+line(`M${n(sx)} ${n(sy+10)}L${n(hx)} ${n(hy-14)}`,gold,1.3);
 s+=line(`M${n(hx-17)} ${n(hy-2)}L${n(hx+17)} ${n(hy-2)}`,gold,4)+shape(`M${n(hx-4)} ${n(hy-6)}h8v8h-8Z`,gold,ink,1);
 if(type==='miner')s+=line(`M${n(sx-9)} ${n(sy-4)}L${n(hx-6)} ${n(hy-5)}M${n(sx+9)} ${n(sy-4)}L${n(hx+6)} ${n(hy-5)}`,dark,4);
 // Head, neck and individual class headgear.
 s+=line(`M${n(sx)} ${n(sy)}L${n(head[0])} ${n(head[1]+15)}`,ink,9);
 s+=`<g transform="translate(${n(head[0])} ${n(head[1])}) rotate(${n(dead?death*75:-hit*12+lean*.5)})">`+circle(0,0,18,ink);
 if(type==='miner')s+=shape('M-20 -3Q-20 -24 0 -24Q21 -24 21 -3Z','url(#leather)',ink,2)+line('M-23 -2H23',gold,5)+circle(9,-14,6,'#fff4ba',gold,2)+line('M-14 7L-4 10',edge,2);
 if(type==='sword')s+=shape('M-20 -4L-15 -23L5 -26L21 -11L19 10L8 16L-12 14Z',metal,ink,2)+shape('M-16 -22L-24 -31L2 -35L11 -24Z',cloth,gold,1.5)+shape('M-12 -6H19V5L3 11L-12 5Z',dark)+line('M6 -3L17 -3',edge,2);
 if(type==='bow')s+=shape('M-23 15Q-27 -22 -5 -28Q17 -26 24 -4L12 -6L-6 -12L-12 8L-8 20Z',dark,edge,1.5)+shape('M-20 -17L-34 -11L-21 0Z',cloth)+line('M7 -2L16 -3',edge,2)+shape('M-11 15L20 10L14 23L-4 25Z',cloth,gold,1);
 if(type==='shield')s+=shape('M-23 -6Q-24 -29 0 -29Q24 -29 23 -5L18 18L-3 23L-23 12Z',metal,ink,2)+shape('M-6 -29L1 -40L8 -29Z',gold)+shape('M-18 -7H21V2H-18Z',dark)+line('M4 5V16M10 4V13',dark,2);
 if(type==='spear')s+=shape('M-20 -4L-13 -26L9 -28L23 -10L15 13L-15 15Z',metal,ink,2)+shape('M-13 -26L-28 -40L-3 -34L9 -28Z',cloth,gold,1)+line('M3 -4L18 -5',dark,4)+shape('M-14 10L-8 21L2 15Z',dark);
 if(type==='mage')s+=shape('M-24 7L-16 -16L-4 -48L13 -24L25 2L11 -2L-3 -10L-16 8Z',dark,edge,1.4)+line('M-9 -25L5 -19',gold,2)+circle(3,-22,3,gold)+line('M5 1L15 0',edge,2);
 s+='</g>';
 // Shoulder plates and articulated, two-segment arms.
 const arm=(origin,hand,back=false)=>{const elbow=knee(origin,hand,22,back?-1:1);return line(`M${n(origin[0])} ${n(origin[1])}L${n(elbow[0])} ${n(elbow[1])}L${n(hand[0])} ${n(hand[1])}`,ink,9)+line(`M${n(elbow[0])} ${n(elbow[1])}L${n(hand[0])} ${n(hand[1])}`,back?dark:metal,5)+circle(hand[0],hand[1],4.5,type==='miner'?'#c49b68':dark,ink,1.3);};
 let front=[sx+31,sy+29],back=[sx-20-gait*10,sy+28];
 const reach=strike*(1-recover);
 if(dead){front=[lerp(159,170,death),lerp(152,208,death)];back=[lerp(108,122,death),lerp(151,208,death)];}
 if(carrying||unload){front=[sx+24,sy+31+(unload?t*12:0)];back=[sx+3,sy+32+(unload?t*12:0)];}
 if(type==='bow'&&attacking){front=[sx+37,sy+2];back=[sx+15-25*(t<contact?t/contact:1-recover),sy+3];}
 if(type==='sword'&&attacking)front=[sx+22+reach*14,sy+12-reach*12];
 if(type==='spear'&&!dead)front=[sx+23+reach*13,sy+17];
 if(type==='mage')front=[sx+30+reach*6,sy+17-reach*25];
 if(working||type==='miner'&&attacking){const a=workAngle*Math.PI/180;front=[sx+22+Math.sin(a)*8,sy+9-Math.cos(a)*8];back=[sx+11+Math.sin(a)*6,sy+17-Math.cos(a)*6];}
 s+=arm([sx-13,sy+4],back,true);
 if(type==='bow'&&!dead)s+=shape(`M${n(sx-27)} ${n(sy-6)}L${n(sx-16)} ${n(sy-9)}L${n(hx-4)} ${n(hy+6)}L${n(hx-18)} ${n(hy+10)}Z`,'url(#leather)',gold,1)+line(`M${n(sx-22)} ${n(sy-4)}l-8 -26M${n(sx-16)} ${n(sy-5)}l-4 -27`,metal,1.8);
 s+=arm([sx+12,sy+3],front);
 s+=shape(`M${n(sx+5)} ${n(sy-5)}L${n(sx+20)} ${n(sy-3)}L${n(sx+24)} ${n(sy+9)}L${n(sx+10)} ${n(sy+13)}L${n(sx+1)} ${n(sy+5)}Z`,type==='miner'?dark:metal,ink,1.5);
 const fx=front[0],fy=front[1];
 if(type==='miner'&&!carrying&&!unload){const angle=dead?75:working||attacking?workAngle:-20;s+=`<g transform="translate(${n(fx)} ${n(fy)}) rotate(${angle})">`+line('M0 25V-41','#b58b54',5)+shape('M-24 -43Q0 -60 27 -42L27 -34Q3 -44 -24 -35Z',metal,ink,2)+line('M0 -38V-11',gold,1.3)+'</g>';}
 if(type==='sword'){const angle=dead?80:attacking?lerp(-95,70,reach):-16;s+=`<g transform="translate(${n(fx)} ${n(fy)}) rotate(${n(angle)})">`+shape('M-5 -7L-5 -63L0 -76L6 -63L5 -7Z',metal,ink,1.8)+line('M0 -64V-12','#fff4cf',1.5)+line('M-13 -5H14',gold,4)+line('M0 0V13',dark,5)+circle(0,14,3,gold)+'</g>';}
 if(type==='bow'){const x=dead?front[0]:sx+40,y=dead?front[1]:sy+5,pull=attacking&&t<contact?24*t/contact:attacking?(1-recover)*3:0;s+=`<g transform="translate(${n(x)} ${n(y)}) rotate(${dead?-90:0})"><path d="M0 -42Q41 0 0 42" fill="none" stroke="${ink}" stroke-width="6"/><path d="M0 -42Q41 0 0 42" fill="none" stroke="${gold}" stroke-width="3"/>${line(`M0 -42L${-pull} 0L0 42`,edge,1.2)}${!attacking||t<contact?line(`M${-16-pull} 0H35`,metal,2)+shape('M39 0L30 -4V4Z',metal,'none'):''}</g>`;}
 if(type==='shield'){
  const bash=attacking?reach*12:0;s+=`<g transform="translate(${n(dead?145:sx+27+bash)} ${n(dead?206:sy+25)}) rotate(${dead?90:skill?-12:-2})">`+shape('M-18 -35L21 -35L25 10Q16 28 1 38Q-16 29 -23 10Z',dark,edge,2.5)+shape('M-12 -29L15 -29L18 9L1 29L-16 9Z',plate,gold,1.5)+line('M1 -22V20M-10 -6H13',gold,3)+circle(1,-6,5,metal,gold,1)+'</g>';
 }
 if(type==='spear'){const tip=dead?75:attacking?90:-12;s+=`<g transform="translate(${n(fx-8)} ${n(fy+1)}) rotate(${tip})">`+line('M0 47V-55','#a98a56',4.5)+shape('M-8 -55L0 -77L9 -55L0 -42Z',metal,ink,1.6)+line('M0 -66V-44',edge,1.1)+shape('M3 -42L19 -35L3 -22Z',cloth,gold,1)+'</g>';}
 if(type==='mage'){
  s+=shape(`M${n(sx-18)} ${n(sy+8)}L${n(sx+15)} ${n(sy+8)}L${n(hx+28)} ${n(224-death*4)}Q${n(hx)} 236 ${n(hx-29)} 223Z`,dark,edge,1.4)+shape(`M${n(sx-2)} ${n(sy+19)}L${n(hx+13)} 222L${n(hx-8)} 225Z`,cloth,gold,1);
  const staffX=dead?lerp(98,202,death):sx-30,staffY=dead?lerp(94,212,death):sy-29;
  s+=line(`M${n(dead?lerp(98,88,death):staffX)} ${n(dead?lerp(214,215,death):sy+91)}L${n(staffX)} ${n(staffY)}`,gold,4)+`<g transform="translate(${n(staffX)} ${n(staffY)}) rotate(${dead?death*90:0})">`+shape('M-10 0L0 -18L10 0L0 16Z','url(#orb)',metal,1.5)+'</g>';
  if(attacking&&!dead){const radius=6+Math.sin(Math.PI*t)*12;s+=circle(fx+5,fy-9,radius,'url(#orb)',edge,1);if(skill)for(let i=0;i<5;i++){const a=i*Math.PI*2/5+phase;s+=circle(fx+5+Math.cos(a)*26,fy-9+Math.sin(a)*26,2,edge);}}
 }
 if(carrying||unload){const bx=sx+16,by=sy+38+(unload?t*23:0),alpha=unload?1-smooth(clamp((t-.55)/.45)):1;s+=`<g opacity="${n(alpha)}" transform="translate(${n(bx)} ${n(by)})">`+shape('M-16 -17Q-31 3 -22 17Q0 30 22 16Q29 -1 13 -17Z','url(#leather)',ink,2)+line('M-16 -17L13 -17',gold,4)+shape('M-14 -23L-5 -29L2 -20L9 -28L15 -20L12 -15H-13Z','#ffda78',gold,1)+shape('M-3 -3L5 4L-3 13L-10 4Z',gold,'none')+'</g>';}
 if(skill&&type!=='mage'&&type!=='miner')s+=`<ellipse cx="${n(hx)}" cy="224" rx="${26+Math.sin(Math.PI*t)*12}" ry="8" fill="none" stroke="${edge}" stroke-width="1.7" opacity="${n(Math.sin(Math.PI*t)*.6)}"/>`;
 s+='</g>';return `<g transform="scale(.75)">${s}</g>`;
}
