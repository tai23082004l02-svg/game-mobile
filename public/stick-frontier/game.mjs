import {Battle,TROOPS,LEVELS,SKILLS} from './engine.mjs';
import {ArtBank} from './art.mjs';
import {createLibrary} from './library.mjs';
const $=id=>document.getElementById(id),canvas=$('field'),ctx=canvas.getContext('2d'),art=new ArtBank();
let artReady=false,unlocked=0,records={},settings={sound:false};
try{unlocked=Math.max(0,Math.min(LEVELS.length-1,Math.floor(Number(localStorage.getItem('frontier-unlocked'))||0)));const p=JSON.parse(localStorage.getItem('frontier-records')||'{}');if(p&&typeof p==='object'&&!Array.isArray(p))for(const [k,v] of Object.entries(p))if(Number.isInteger(Number(k))&&+k>=0&&+k<20&&v&&Number.isFinite(v.time)&&Number.isInteger(v.stars)&&v.stars>=1&&v.stars<=3)records[k]=v;const s=JSON.parse(localStorage.getItem('frontier-settings')||'{}');settings.sound=s.sound===true;}catch{}
let battle=new Battle(),active=false,paused=false,reported=false,camera=0,view=1100,last=0,accumulator=0,toastUntil=0,audio=null,selected=null,markerX=null,region=Math.floor(unlocked/5),uiLast=0;
let width=1000,height=450,scale=1,worldOffset=0,pan=null,libraryPaused=false;
const names={attack:'ĐANG TẤN CÔNG',defend:'ĐANG PHÒNG THỦ',retreat:'ĐANG RÚT LUI'};
function save(key,value){try{localStorage.setItem(key,typeof value==='string'?value:JSON.stringify(value));return true;}catch{return false;}}
function beep(f=360){if(!settings.sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.setValueAtTime(f,audio.currentTime);o.frequency.exponentialRampToValueAtTime(f*.5,audio.currentTime+.15);g.gain.setValueAtTime(.04,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.18);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.2);}catch{}}
function toast(text){$('toast').textContent=text;toastUntil=performance.now()+3300;$('toast').classList.add('show');}
function levels(){
 $('regions').replaceChildren();['Đồng cỏ','Đèo đá','Thung lũng','Pháo đài'].forEach((name,i)=>{const b=document.createElement('button');b.textContent=name;b.className=i===region?'active':'';b.onclick=()=>{region=i;levels();};$('regions').append(b);});
 $('levels').replaceChildren();LEVELS.slice(region*5,region*5+5).forEach((l,j)=>{const i=region*5+j,b=document.createElement('button');b.disabled=i>unlocked||!artReady;b.className=l.boss?'boss':'';const stars=records[i]?.stars||0;b.innerHTML=`<span class="number">${String(i+1).padStart(2,'0')}</span><span class="level-name">${l.name}</span><span class="status">${i>unlocked?'KHÓA':stars?`<span class="stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</span>`:l.boss?'⚑ THỦ LĨNH':'CHƠI →'}</span>`;b.onclick=()=>start(i);$('levels').append(b);});
}
function cancelTarget(){selected=null;markerX=null;$('cancel-target').hidden=true;canvas.classList.remove('targeting');$('camera-hint').textContent='Kéo để quan sát';document.querySelectorAll('[data-skill]').forEach(b=>b.classList.remove('selected'));}
function start(i){battle=new Battle(i);active=true;paused=false;reported=false;camera=0;accumulator=0;cancelTarget();$('menu').hidden=true;$('dialog').hidden=true;$('pause').textContent='II';$('pause').setAttribute('aria-label','Tạm dừng');$('mission-label').textContent=`${LEVELS[i].region.toUpperCase()} / ${String(i+1).padStart(2,'0')}`;$('mission-title').textContent=LEVELS[i].name;setOrder('defend');toast(LEVELS[i].description);beep(520);ui();}
function setOrder(order){battle.order=order;document.querySelectorAll('[data-order]').forEach(b=>{b.classList.toggle('active',b.dataset.order===order);b.setAttribute('aria-pressed',String(b.dataset.order===order));});$('order-label').textContent=names[order];}
for(const [type,d] of Object.entries(TROOPS)){
 const b=document.createElement('button');b.className='troop';b.dataset.troop=type;b.setAttribute('aria-label',`Tuyển ${d.name}, ${d.cost} vàng. ${d.skill}: ${d.skillText}`);b.innerHTML=`<span class="symbol"><img src="assets/icon-${type}.svg" alt=""></span><span class="name">${d.name}</span><span class="price">◆ ${d.cost}</span>`;
 b.onclick=()=>{if(!active||paused)return;if(battle.recruit(type)){beep();toast(`${d.name} đang được huấn luyện`);}else toast('Chưa thể tuyển: kiểm tra vàng, quân số và hàng chờ.');ui();};$('recruits').append(b);
}
for(const [key,s] of Object.entries(SKILLS)){
 const b=document.createElement('button');b.className='skill-button';b.dataset.skill=key;b.title=s.text;b.setAttribute('aria-label',`${s.name}, ${s.cost} linh lực. ${s.text}`);b.innerHTML=`<img src="assets/icon-${key}.svg" alt=""><span><span class="skill-name">${s.name}</span><small>✦ ${s.cost}</small></span><span class="cooldown" hidden></span>`;
 b.onclick=()=>{if(!active||paused||!battle.canCast(key))return;if(selected===key){cancelTarget();return;}if(!s.target){battle.cast(key);beep(650);toast('Chiến kỳ: toàn quân tăng sức mạnh trong 8 giây!');ui();return;}selected=key;markerX=camera+view/2-worldOffset;$('cancel-target').hidden=false;canvas.classList.add('targeting');$('camera-hint').textContent=`Chạm để dùng ${s.name}`;document.querySelectorAll('[data-skill]').forEach(el=>el.classList.toggle('selected',el.dataset.skill===key));toast(`${s.name}: chạm vùng muốn dùng trên chiến trường.`);};$('skills').append(b);
}
$('cancel-target').onclick=cancelTarget;
$('cancel-queue').onclick=()=>{if(active&&!paused&&battle.cancelRecruit()){toast('Đã hủy lính cuối hàng chờ và hoàn vàng.');ui();}};
document.querySelectorAll('[data-order]').forEach(b=>b.onclick=()=>{if(!active||paused||battle.result)return;setOrder(b.dataset.order);beep(440);});
function dialog(tag,title,text,actions){$('dialog-tag').textContent=tag;$('dialog-title').textContent=title;$('dialog-text').textContent=text;$('dialog-actions').replaceChildren();for(const [label,fn,primary]of actions){const b=document.createElement('button');b.textContent=label;b.className=primary?'primary':'';b.onclick=fn;$('dialog-actions').append(b);}$('dialog').hidden=false;}
function resume(){paused=false;accumulator=0;$('dialog').hidden=true;$('pause').textContent='II';$('pause').setAttribute('aria-label','Tạm dừng');}
function menu(){active=false;cancelTarget();$('dialog').hidden=true;$('menu').hidden=false;region=Math.floor(unlocked/5);levels();}
function help(){const wasPaused=paused;paused=true;dialog('CẨM NANG CHỈ HUY','Giữ vàng. Giữ đội hình.','1. Tuyển thợ mỏ: 22 vàng mỗi 5 giây và kỹ năng Mạch vàng, tối đa 6 thợ.\n2. Tuyển quân: kỹ năng riêng tự kích hoạt khi giao tranh. Thương binh mở màn 3, pháp sư mở màn 5.\n3. Tập kết bằng Phòng thủ, chọn Tấn công để phá căn cứ. Rút lui để bảo toàn lực lượng.\n4. Chạm kỹ năng chỉ huy, rồi chạm chiến trường để chọn vùng. Chiến kỳ tác dụng toàn quân. Linh lực hồi tự động.\n5. Kéo ngang để quan sát. Mở màn tiếp theo khi thắng. Thắng dưới 6 phút được thêm sao; giữ trên nửa máu căn cứ được thêm sao.',[['Đã hiểu',()=>{paused=wasPaused;$('dialog').hidden=true;},true]]);}
$('help').onclick=help;$('menu-help').onclick=help;
const library=createLibrary(art,()=>{libraryPaused=paused;paused=true;cancelTarget();},()=>{paused=libraryPaused;accumulator=0;});
document.querySelector('.brand').onclick=e=>{e.preventDefault();if(active){paused=true;cancelTarget();dialog('CHIẾN DỊCH','Về chọn màn?','Trận hiện tại sẽ bắt đầu lại khi bạn chọn màn. Các màn đã mở và số sao vẫn được giữ.',[['Tiếp tục',resume],['Chọn màn',menu,true]]);}};
$('pause').onclick=()=>{if(!active||battle.result||!$('dialog').hidden||library.visible)return;paused=true;cancelTarget();$('pause').textContent='▶';dialog('NGHỈ GIỮA TRẬN','Đã tạm dừng','Đội quân đang chờ mệnh lệnh của bạn.',[['Chọn màn',menu],['Chơi lại',()=>start(battle.level)],['Tiếp tục',resume,true]]);};
function soundLabel(){$('sound').textContent=settings.sound?'Âm: bật':'Âm: tắt';$('sound').setAttribute('aria-label',settings.sound?'Tắt âm thanh':'Bật âm thanh');}soundLabel();
$('sound').onclick=()=>{settings.sound=!settings.sound;save('frontier-settings',settings);soundLabel();beep();};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else{await document.documentElement.requestFullscreen();try{await screen.orientation.lock('landscape');}catch{}}}catch{toast('Bạn có thể xoay ngang điện thoại để chơi.');}};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&active&&!paused&&!battle.result)$('pause').click();});document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(library.visible)library.close();else cancelTarget();}});
function clampCamera(){camera=Math.max(0,Math.min(1800-view,camera));}
$('home-camera').onclick=()=>{camera=0;};$('enemy-camera').onclick=()=>{camera=1800-view;clampCamera();};
canvas.onpointerdown=e=>{pan={x:e.clientX,camera,moved:false};canvas.setPointerCapture(e.pointerId);};
canvas.onpointermove=e=>{const r=canvas.getBoundingClientRect();markerX=Math.max(0,Math.min(1800,camera+(e.clientX-r.left)/scale-worldOffset));if(pan){if(Math.abs(e.clientX-pan.x)>10)pan.moved=true;camera=pan.camera-(e.clientX-pan.x)/scale;clampCamera();}};
canvas.onpointerup=e=>{if(selected&&pan&&!pan.moved&&active&&!paused){const r=canvas.getBoundingClientRect(),x=Math.max(0,Math.min(1800,camera+(e.clientX-r.left)/scale-worldOffset));if(battle.cast(selected,x)){beep(selected==='meteor'?160:600);toast(`${SKILLS[selected].name} đã kích hoạt!`);cancelTarget();ui();}}pan=null;};canvas.onpointercancel=()=>{pan=null;};
$('minimap').onpointerdown=e=>{const r=e.currentTarget.getBoundingClientRect();camera=(e.clientX-r.left)/r.width*1800-view/2;clampCamera();};
function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;if(!height||!width)return;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);scale=height/480;view=width/scale;worldOffset=Math.max(0,(view-1800)/2);clampCamera();}new ResizeObserver(resize).observe(canvas);
function text(s,x,y,size=12,color='#eff5dd',align='center'){ctx.fillStyle=color;ctx.font=`600 ${size}px system-ui`;ctx.textAlign=align;ctx.fillText(s,x,y);}
function circle(x,y,r,fill,stroke){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
function tower(b,team){art.prop(ctx,team,b.x,412,210);ctx.fillStyle='#19353c';ctx.fillRect(b.x-57,235,114,8);ctx.fillStyle=team?'#f6ae91':'#b4edda';ctx.fillRect(b.x-56,236,112*Math.max(0,b.hp/b.max),6);text(`${Math.ceil(b.hp)} / ${b.max}`,b.x,228,10,'#15363d');text(team?'THÀNH TRÌ ĐỊCH':'CĂN CỨ CỦA BẠN',b.x,443,10,team?'#754a44':'#294e50');}
function draw(now){
 ctx.clearRect(0,0,width,height);ctx.fillStyle='#aac2b6';ctx.fillRect(0,0,width,height);ctx.save();ctx.scale(scale,scale);ctx.translate(worldOffset-camera,0);
 const terrain=art.images.get(`terrain-${battle.config.terrain}.svg`);if(terrain)ctx.drawImage(terrain,-worldOffset,0,Math.max(1800,view),480);
 art.prop(ctx,2,300,413,142);tower(battle.bases[0],0);tower(battle.bases[1],1);
 for(const u of [...battle.corpses,...battle.units].sort((a,b)=>a.lane-b.lane)){
  if(u.x<camera-100||u.x>camera+view+100)continue;const y=381+u.lane*12,size=u.elite?178:148;art.unit(ctx,u,u.x,y,size);
  if(u.elite)text('◆',u.x,y-size*.9,13,'#e6b85d');
  if(u.hp>0&&u.hp<u.max){ctx.fillStyle='#17313b';ctx.fillRect(u.x-18,y-76,36,4);ctx.fillStyle=u.team?'#f4b19a':'#a6efdb';ctx.fillRect(u.x-18,y-76,36*Math.max(0,u.hp/u.max),4);}
  if(u.barrier>0)art.effect(ctx,'barrier',(now%800)/800,u.x,y-36,90,u.team);
  if(u.slow>0)art.effect(ctx,'frost',(now%800)/800,u.x,y-10,50,u.team);
  if(!u.team&&battle.rally>0)circle(u.x,y+2,13,null,'#b9f6dd88');
 }
 for(const p of battle.projectiles)art.effect(ctx,p.kind,(p.age*8)%1,p.x,p.y,p.kind==='fireball'?70:60,p.team);
 for(const e of battle.effects){const progress=1-e.left/e.total;if(e.kind==='text'){ctx.globalAlpha=Math.min(1,e.left*3);text(e.text,e.x,e.y-progress*24,12,e.text.startsWith('+')?'#7c5d1c':'#974c3c');ctx.globalAlpha=1;continue;}
  if(e.warning){ctx.fillStyle='#e78b5944';ctx.beginPath();ctx.ellipse(e.x,391,e.radius,25,0,0,Math.PI*2);ctx.fill();art.effect(ctx,'meteor',progress,e.x+90*(1-progress),100+progress*245,160);}
  else if(e.area){ctx.save();ctx.globalAlpha=.7;ctx.beginPath();ctx.ellipse(e.x,391,e.radius,25,0,0,Math.PI*2);ctx.strokeStyle=e.kind==='heal'?'#b6f7d7':'#ffddb3';ctx.lineWidth=3;ctx.stroke();ctx.restore();for(let i=-1;i<=1;i++){ctx.save();ctx.translate(e.x+i*75,e.kind==='arrow'?210+progress*160:355);if(e.kind==='arrow')ctx.rotate(Math.PI/2);art.effect(ctx,e.kind,progress,0,0,130,e.team);ctx.restore();}}
  else art.effect(ctx,e.kind,progress,e.x,e.y,e.kind==='dust'?40:e.kind==='blast'||e.kind==='frost'?170:95,e.team);
 }
 if(selected&&markerX!==null){const s=SKILLS[selected];ctx.fillStyle=selected==='heal'?'#adf5cd33':'#efc77a33';ctx.strokeStyle=selected==='heal'?'#adf5cd':'#efc77a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(markerX,391,s.radius,30,0,0,Math.PI*2);ctx.fill();ctx.stroke();text(s.name,markerX,315,14,'#15323c');}
 ctx.restore();if(now>toastUntil)$('toast').classList.remove('show');
}
function ui(){
 $('gold').textContent=Math.floor(battle.gold);$('population').textContent=battle.population;$('timer').textContent=`${String(Math.floor(battle.time/60)).padStart(2,'0')}:${String(Math.floor(battle.time%60)).padStart(2,'0')}`;$('wave').textContent=`${Math.ceil(battle.enemyTimer)}s`;$('energy').textContent=Math.floor(battle.energy);$('energy-bar').style.width=`${battle.energy}%`;
 $('queue').textContent=battle.queue.length?`Đang tuyển: ${TROOPS[battle.queue[0].type].name} (${Math.ceil(battle.queue[0].left)}s) · Hàng chờ ${battle.queue.length}/5`:'Thu nhập: 22 vàng / thợ / 5 giây · Quân tự dùng kỹ năng';$('cancel-queue').hidden=!battle.queue.length;
 document.querySelectorAll('[data-troop]').forEach(b=>{const t=b.dataset.troop,d=TROOPS[t],miners=battle.units.filter(u=>!u.team&&u.type==='miner').length+battle.queue.filter(q=>q.type==='miner').length;b.disabled=!active||paused||!!battle.result||battle.level<d.unlock||battle.gold<d.cost||battle.population>=30||battle.queue.length>=5||(t==='miner'&&miners>=6);b.querySelector('.price').textContent=battle.level<d.unlock?`Mở màn ${d.unlock+1}`:`◆ ${d.cost}`;});
 document.querySelectorAll('[data-skill]').forEach(b=>{const key=b.dataset.skill,left=battle.cooldowns[key],cool=b.querySelector('.cooldown');cool.hidden=left<=0;cool.textContent=`${Math.ceil(left)}s`;b.disabled=!active||paused||!battle.canCast(key);});
 $('map-window').style.left=`${camera/1800*100}%`;$('map-window').style.width=`${Math.min(100,view/1800*100)}%`;
}
function finished(){reported=true;cancelTarget();const win=battle.result==='win';let stars=0;if(win){stars=1+(battle.time<360?1:0)+(battle.bases[0].hp>=battle.bases[0].max*.5?1:0);unlocked=Math.max(unlocked,Math.min(LEVELS.length-1,battle.level+1));const old=records[battle.level];records[battle.level]={stars:Math.max(stars,old?.stars||0),time:Math.min(battle.time,old?.time??Infinity)};if(!save('frontier-unlocked',String(unlocked))||!save('frontier-records',records))toast('Trình duyệt không cho phép lưu tiến trình.');beep(700);}
 const actions=[['Chọn màn',menu],['Chơi lại',()=>start(battle.level)]];if(win&&battle.level<LEVELS.length-1)actions.push(['Màn tiếp theo',()=>start(battle.level+1),true]);dialog(win?'VÙNG ĐẤT ĐÃ ĐƯỢC GIẢI PHÓNG':'CĂN CỨ ĐÃ THẤT THỦ',win?(battle.level===LEVELS.length-1?'Hoàn thành chiến dịch!':'Chiến thắng!'):'Tập hợp lại đội quân',win?`${'★'.repeat(stars)}${'☆'.repeat(3-stars)}\n${LEVELS[battle.level].name}\n${Math.floor(battle.time/60)} phút ${Math.floor(battle.time%60)} giây · Hạ ${battle.kills} quân địch`:'Hãy đầu tư thợ mỏ, dùng hộ vệ che chắn và kết hợp các kỹ năng chỉ huy. Bạn có thể thử lại ngay.',actions);
}
function frame(now){const dt=last?Math.min((now-last)/1000,.1):0;last=now;if(active&&!paused&&!battle.result){accumulator+=dt;while(accumulator>=1/30){battle.step(1/30);accumulator-=1/30;}}else accumulator=0;draw(now);library.frame(now);if(now-uiLast>100){ui();uiLast=now;}if(active&&battle.result&&!reported)finished();requestAnimationFrame(frame);}
art.ready().then(ok=>{artReady=ok;levels();$('load-status').textContent=ok?'Bộ hình ảnh đã sẵn sàng · Phiên bản 2':`Không tải được ${art.failed.length} sheet. Kiểm tra mạng rồi tải lại trang.`;});
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
levels();resize();ui();requestAnimationFrame(frame);
