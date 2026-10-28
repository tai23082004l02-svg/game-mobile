import {Battle,TROOPS,LEVELS} from './engine.mjs';
const $=id=>document.getElementById(id),canvas=$('field'),ctx=canvas.getContext('2d');
const symbols={miner:'⚒',sword:'⚔',bow:'➶',shield:'⬡'};
let unlocked=0;try{unlocked=Math.max(0,Math.min(4,Number(localStorage.getItem('frontier-unlocked'))||0));}catch{}
let battle=new Battle(),active=false,paused=false,reported=false,camera=0,view=1100,last=0,toastUntil=0,audio=null,sound=false;
let width=1000,height=450,scale=1,pan=null;
const names={attack:'ĐANG TẤN CÔNG',defend:'ĐANG PHÒNG THỦ',retreat:'ĐANG RÚT LUI'};
function beep(f=360){if(!sound)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.13);}catch{}}
function toast(text){$('toast').textContent=text;toastUntil=performance.now()+2400;$('toast').classList.add('show');}
function levels(){
  $('levels').replaceChildren();
  LEVELS.forEach((l,i)=>{const b=document.createElement('button');b.disabled=i>unlocked;b.innerHTML=`<span class="number">0${i+1}</span><span class="level-name">${l.name}</span><span class="status">${i>unlocked?'KHÓA':i<unlocked?'✓ HOÀN THÀNH':'CHƠI →'}</span>`;b.onclick=()=>start(i);$('levels').append(b);});
}
function start(i){battle=new Battle(i);active=true;paused=false;reported=false;camera=0;$('menu').hidden=true;$('dialog').hidden=true;$('pause').textContent='Ⅱ';$('pause').setAttribute('aria-label','Tạm dừng');$('mission-label').textContent=`CHIẾN DỊCH / 0${i+1}`;$('mission-title').textContent=LEVELS[i].name;setOrder('defend');toast(LEVELS[i].description);beep(520);}
function setOrder(order){battle.order=order;document.querySelectorAll('[data-order]').forEach(b=>{b.classList.toggle('active',b.dataset.order===order);b.setAttribute('aria-pressed',String(b.dataset.order===order));});$('order-label').textContent=names[order];}
for(const [type,d] of Object.entries(TROOPS)){
 const b=document.createElement('button');b.className='troop';b.dataset.troop=type;b.setAttribute('aria-label',`Tuyển ${d.name}, ${d.cost} vàng`);b.innerHTML=`<span class="symbol">${symbols[type]}</span><span class="name">${d.name}</span><span class="price">◆ ${d.cost}</span>`;
 b.onclick=()=>{if(!active||paused)return;if(battle.recruit(type)){beep();toast(`${d.name} đang được huấn luyện`);}else toast(battle.population>=30?'Đã đủ 30 quân.':battle.queue.length>=5?'Hàng chờ đã đầy.':type==='miner'&&battle.units.filter(u=>u.team===0&&u.type==='miner').length>=6?'Tối đa 6 thợ mỏ.':'Chưa đủ vàng hoặc đã đủ thợ mỏ.');};$('recruits').append(b);
}
document.querySelectorAll('[data-order]').forEach(b=>b.onclick=()=>{if(!active||paused||battle.result)return;setOrder(b.dataset.order);beep(440);});
function dialog(tag,title,text,actions){$('dialog-tag').textContent=tag;$('dialog-title').textContent=title;$('dialog-text').textContent=text;$('dialog-actions').replaceChildren();for(const [label,fn,primary] of actions){const b=document.createElement('button');b.textContent=label;b.className=primary?'primary':'';b.onclick=fn;$('dialog-actions').append(b);}$('dialog').hidden=false;}
function resume(){paused=false;$('dialog').hidden=true;$('pause').textContent='Ⅱ';$('pause').setAttribute('aria-label','Tạm dừng');}
function menu(){active=false;$('dialog').hidden=true;$('menu').hidden=false;levels();}
function help(){const wasPaused=paused;paused=true;dialog('CẨM NANG CHỈ HUY','Giữ vàng. Giữ đội hình.','1. Tuyển thợ mỏ: mỗi thợ thu 22 vàng sau 5 giây khai thác, tối đa 6 thợ.\n2. Tuyển kiếm sĩ, cung thủ và hộ vệ. Quân tự chiến đấu.\n3. Chọn Tấn công để phá căn cứ địch. Phòng thủ để tập kết, Rút lui để về căn cứ.\n4. Kéo chiến trường hoặc chạm thanh bản đồ để quan sát. Căn cứ tự bắn địch ở gần.\nPhá căn cứ địch để mở màn tiếp theo.',[['Đã hiểu',()=>{paused=wasPaused;$('dialog').hidden=true;},true]]);}
$('help').onclick=help;$('menu-help').onclick=help;document.querySelector('.brand').onclick=e=>{e.preventDefault();if(active){paused=true;dialog('CHIẾN DỊCH','Về chọn màn?','Trận hiện tại sẽ bắt đầu lại khi bạn chọn màn. Các màn đã mở vẫn được giữ.',[['Tiếp tục',resume],['Chọn màn',menu,true]]);}};
$('pause').onclick=()=>{if(!active||battle.result)return;paused=true;$('pause').textContent='▶';dialog('NGHỈ GIỮA TRẬN','Đã tạm dừng','Đội quân đang chờ mệnh lệnh của bạn.',[['Chọn màn',menu],['Chơi lại',()=>start(battle.level)],['Tiếp tục',resume,true]]);};
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'Âm: bật':'Âm: tắt';$('sound').setAttribute('aria-label',sound?'Tắt âm thanh':'Bật âm thanh');beep();};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else{await document.documentElement.requestFullscreen();try{await screen.orientation.lock('landscape');}catch{}}}catch{toast('Bạn có thể xoay ngang điện thoại để chơi.');}};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&active&&!paused&&!battle.result)$('pause').click();});
function clampCamera(){camera=Math.max(0,Math.min(1800-view,camera));}
$('home-camera').onclick=()=>{camera=0;};$('enemy-camera').onclick=()=>{camera=1800-view;};
canvas.onpointerdown=e=>{pan={x:e.clientX,camera};canvas.setPointerCapture(e.pointerId);};canvas.onpointermove=e=>{if(pan){camera=pan.camera-(e.clientX-pan.x)/scale;clampCamera();}};canvas.onpointerup=canvas.onpointercancel=()=>pan=null;
$('minimap').onpointerdown=e=>{const r=e.currentTarget.getBoundingClientRect();camera=(e.clientX-r.left)/r.width*1800-view/2;clampCamera();};
function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);scale=height/480;view=Math.min(1800,width/scale);if(view===1800)scale=width/1800;clampCamera();}
new ResizeObserver(resize).observe(canvas);
function path(points,fill,stroke,line=2){ctx.beginPath();for(let i=0;i<points.length;i++)ctx[i?'lineTo':'moveTo'](...points[i]);if(fill){ctx.closePath();ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();}}
function circle(x,y,r,fill,stroke){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
function text(s,x,y,size=12,color='#eff5dd',align='center'){ctx.fillStyle=color;ctx.font=`600 ${size}px system-ui`;ctx.textAlign=align;ctx.fillText(s,x,y);}
function hills(factor,base,color,seed){const points=[[-100,500]];for(let x=-100;x<2000;x+=35){const wx=x+camera*factor;points.push([x,base+Math.sin(wx*.006+seed)*30+Math.sin(wx*.013+seed)*18]);}points.push([2000,500]);path(points,color);}
function tower(base,team){const x=base.x,blue=team===0,color=blue?'#28454d':'#644549',trim=blue?'#9de1d7':'#f6ac88';
 ctx.fillStyle='#152d312a';ctx.beginPath();ctx.ellipse(x,412,80,15,0,0,7);ctx.fill();
 path([[x-45,400],[x-38,275],[x-21,275],[x-21,290],[x-8,290],[x-8,275],[x+8,275],[x+8,290],[x+21,290],[x+21,275],[x+38,275],[x+45,400]],color,'#142d35',3);
 ctx.fillStyle=blue?'#365c62':'#89585a';ctx.fillRect(x-29,310,58,90);ctx.fillStyle='#142a32';ctx.fillRect(x-13,360,26,40);ctx.fillRect(x-22,321,9,18);ctx.fillRect(x+13,321,9,18);
 path([[x,275],[x,216]],null,'#21353c',4);path([[x+2,217],[x+48,225],[x+2,244]],trim);circle(x,295,6,trim);
 ctx.fillStyle='#162e33';ctx.fillRect(x-51,251,102,7);ctx.fillStyle=trim;ctx.fillRect(x-50,252,100*Math.max(0,base.hp/base.max),5);
 text(blue?'CĂN CỨ CỦA BẠN':'THÀNH TRÌ ĐỊCH',x,435,10,blue?'#294e50':'#643d37');
 text(`${Math.max(0,Math.ceil(base.hp))} / ${base.max}`,x,246,9,'#213c40');
}
function unit(u){const x=u.x,y=377+u.lane*12,teamColor=u.team?'#f4b19a':'#a6efdb',ink=u.flash?'#fff7c7':'#172f3c';const walking=Math.sin(u.walk),bob=Math.abs(walking)*1.4;
 ctx.save();ctx.translate(x,y-bob);ctx.scale(u.team?-1:1,1);
 ctx.fillStyle='#162d3528';ctx.beginPath();ctx.ellipse(0,5+bob,15,4,0,0,7);ctx.fill();
 const moving=walking*7;
 path([[-7+moving,1],[-3,-13],[0,-27],[5,-14],[9-moving,1]],null,ink,5);
 path([[0,-28],[0,-44]],null,ink,7);circle(0,-51,8,ink);
 path([[-7,-53],[0,-60],[9,-53]],teamColor);path([[-2,-42],[-5,-28],[7,-29],[5,-42]],teamColor);
 const swing=u.cool>u.rate*.7?-8:0;
 if(u.type==='miner'){
   path([[0,-37],[10,-31],[20,-45+swing]],null,ink,4);path([[15,-35],[29,-58+swing]],null,'#9c7447',3);path([[18,-58+swing],[30,-60+swing],[35,-50+swing]],null,'#d2e0d9',4);circle(2,-57,5,'#efc775');
 }else if(u.type==='sword'){
   path([[0,-37],[12,-27],[22,-36+swing]],null,ink,4);path([[20,-31+swing],[33,-63+swing],[38,-68+swing],[35,-54+swing],[25,-29+swing]],'#e0f3e5','#639b9b',1);path([[17,-35+swing],[30,-30+swing]],null,'#e9bf6f',3);
 }else if(u.type==='bow'){
   path([[0,-38],[20,-39]],null,ink,4);ctx.beginPath();ctx.arc(15,-38,20,-1.35,1.35);ctx.strokeStyle='#d6b675';ctx.lineWidth=3;ctx.stroke();path([[19,-57],[u.cool>.8?8:20,-38],[19,-19]],null,'#edf0c9',1);path([[11,-38],[40,-38]],null,'#e8e8c8',2);
 }else{
   path([[0,-38],[16,-33]],null,ink,4);path([[7,-47],[25,-48],[27,-26],[17,-16],[7,-27]],u.team?'#b7786e':'#5c9994',teamColor,2);path([[17,-43],[17,-25]],null,teamColor,2);path([[-10,-31],[-12,-67]],null,'#c7d9d3',3);path([[-16,-67],[-12,-76],[-8,-67]],'#e2e7d3');
 }
 if(u.hp<u.max){ctx.fillStyle='#17313b';ctx.fillRect(-15,-73,30,4);ctx.fillStyle=teamColor;ctx.fillRect(-15,-73,30*Math.max(0,u.hp/u.max),4);}
 ctx.restore();}
function draw(now){
 ctx.clearRect(0,0,width,height);const sky=ctx.createLinearGradient(0,0,0,height);sky.addColorStop(0,battle.level>2?'#788c9d':'#88aeb0');sky.addColorStop(.7,'#e7dbb3');sky.addColorStop(1,'#c4c790');ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
 ctx.save();ctx.scale(scale,scale);
 circle(view*.74-camera*.03,110,45,'#f6e5b680');circle(view*.74-camera*.03,110,33,'#f8eac7');
 hills(.12,215,'#789c94',1);hills(.25,262,'#5b8479',3);hills(.4,304,'#436f64',5);
 for(let i=0;i<24;i++){let x=(i*113-camera*.5)%2000;if(x<0)x+=2000;const y=300+Math.sin(i*2)*20;path([[x,y-38],[x-11,y],[x+11,y]],'#3a685e');path([[x,y-50],[x-8,y-19],[x+8,y-19]],'#3a685e');}
 path([[0,336],[2000,336],[2000,500],[0,500]],'#a9b57d');path([[0,363],[2000,363],[2000,424],[0,424]],'#c9bd8c');
 ctx.save();ctx.translate(-camera,0);
 for(let i=0;i<150;i++){const x=(i*179+31)%1800,y=343+(i*23)%130;path([[x,y],[x+3,y-5],[x+6,y]],null,i%3?'#91a66a':'#e0d0a0',1);}
 // Gold outcrop, flags and stone details are drawn locally: no external art needed.
 path([[260,401],[267,376],[281,371],[293,380],[309,374],[330,403]],'#7e8974','#69796a',2);
 for(let i=0;i<5;i++)path([[271+i*9,392-i%2*8],[275+i*9,382-i%2*6],[281+i*9,389-i%2*7]],'#e9bf62');
 tower(battle.bases[0],0);tower(battle.bases[1],1);
 for(const u of [...battle.units].sort((a,b)=>a.lane-b.lane))if(u.x>camera-60&&u.x<camera+view+60)unit(u);
 for(const p of battle.projectiles){const dir=p.team?-1:1;path([[p.x-dir*16,p.y],[p.x,p.y]],null,p.team?'#ffd5a7':'#dbfff0',2);path([[p.x-dir*4,p.y-3],[p.x,p.y],[p.x-dir*4,p.y+3]],null,'#f2f5d2',1);}
 for(const e of battle.effects){ctx.globalAlpha=Math.min(1,e.left*2);text(e.text,e.x,e.y-(1-e.left)*30,12,e.text.startsWith('+')?'#80611b':'#8e4032');}ctx.globalAlpha=1;
 ctx.restore();ctx.restore();
 $('gold').textContent=Math.floor(battle.gold);$('population').textContent=battle.population;$('timer').textContent=`${String(Math.floor(battle.time/60)).padStart(2,'0')}:${String(Math.floor(battle.time%60)).padStart(2,'0')}`;$('wave').textContent=`${Math.ceil(battle.enemyTimer)}s`;
 $('queue').textContent=battle.queue.length?`Đang tuyển: ${TROOPS[battle.queue[0].type].name} (${Math.ceil(battle.queue[0].left)}s) · Hàng chờ ${battle.queue.length}/5`:'Mỗi thợ mỏ thu 22 vàng / 5 giây · Tối đa 6 thợ';
 document.querySelectorAll('[data-troop]').forEach(b=>{const t=b.dataset.troop;const miners=battle.units.filter(u=>u.team===0&&u.type==='miner').length+battle.queue.filter(q=>q.type==='miner').length;b.disabled=!active||paused||!!battle.result||battle.gold<TROOPS[t].cost||battle.population>=30||battle.queue.length>=5||(t==='miner'&&miners>=6);});
 $('map-window').style.left=`${camera/1800*100}%`;$('map-window').style.width=`${view/1800*100}%`;
 if(now>toastUntil)$('toast').classList.remove('show');
}
function finished(){reported=true;const win=battle.result==='win';if(win){unlocked=Math.max(unlocked,Math.min(4,battle.level+1));try{localStorage.setItem('frontier-unlocked',String(unlocked));}catch{toast('Không thể lưu tiến trình trong trình duyệt này.');}beep(700);}
 const actions=[['Chọn màn',menu],['Chơi lại',()=>start(battle.level)]];if(win&&battle.level<4)actions.push(['Màn tiếp theo',()=>start(battle.level+1),true]);
 dialog(win?'VÙNG ĐẤT ĐÃ ĐƯỢC GIẢI PHÓNG':'CĂN CỨ ĐÃ THẤT THỦ',win?(battle.level===4?'Hoàn thành chiến dịch!':'Chiến thắng!'):'Tập hợp lại đội quân',win?`Bạn đã chinh phục ${LEVELS[battle.level].name} trong ${Math.floor(battle.time/60)} phút ${Math.floor(battle.time%60)} giây.`:'Hãy tuyển thêm thợ mỏ từ đầu trận và dùng hộ vệ bảo vệ cung thủ. Bạn có thể thử lại ngay.',actions);
}
function frame(now){const dt=last?Math.min((now-last)/1000,.1):0;last=now;if(active&&!paused&&!battle.result)battle.step(dt);draw(now);if(active&&battle.result&&!reported)finished();requestAnimationFrame(frame);}
levels();resize();requestAnimationFrame(frame);
