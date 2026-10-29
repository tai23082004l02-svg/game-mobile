export const MINING={cycle:1.25,frames:12,impactFrame:8,strikesPerPayout:4,amount:22};
export const TROOPS = {
 miner:{name:'Thợ mỏ',cost:60,hp:80,speed:40,damage:0,range:0,rate:1,train:2,unlock:0,armor:0,skill:'Mạch vàng',skillText:'Mỗi 24 giây, tìm thêm 35 vàng trong mỏ. Mang về trụ để nhận.',skillCD:24,role:'Kinh tế'},
 sword:{name:'Kiếm sĩ',cost:90,hp:155,speed:55,damage:23,range:46,rate:1.05,train:2,unlock:0,armor:0,skill:'Trảm nguyệt',skillText:'Mỗi 8 giây: chém tối đa 3 địch gần, gây 36 sát thương mỗi mục tiêu.',skillCD:8,role:'Cận chiến'},
 bow:{name:'Cung thủ',cost:130,hp:90,speed:43,damage:21,range:245,rate:1.35,train:2.5,unlock:0,armor:0,skill:'Xuyên phong',skillText:'Mỗi 10 giây: bắn hai mục tiêu trong tầm, 32 sát thương bỏ qua giáp.',skillCD:10,role:'Đánh xa'},
 shield:{name:'Hộ vệ',cost:170,hp:350,speed:33,damage:18,range:48,rate:1.4,train:3.2,unlock:0,armor:.25,skill:'Thiết bích',skillText:'Mỗi 12 giây trong giao tranh: giảm 70% sát thương nhận vào trong 3 giây.',skillCD:12,role:'Chống chịu'},
 spear:{name:'Thương binh',cost:155,hp:185,speed:48,damage:27,range:100,rate:1.35,train:2.7,unlock:2,armor:.08,skill:'Phá giáp',skillText:'Mỗi 9 giây: đâm xuyên gây 60 sát thương bỏ qua giáp.',skillCD:9,role:'Diệt giáp'},
 mage:{name:'Pháp sư',cost:240,hp:105,speed:38,damage:33,range:215,rate:2,train:3.8,unlock:4,armor:0,skill:'Băng hoàn',skillText:'Mỗi 13 giây: 38 sát thương vùng và làm chậm 45% trong 4 giây.',skillCD:13,role:'Sát thương vùng'}
};
export const SKILLS={
 volley:{name:'Mưa tên',cost:30,cooldown:18,radius:160,icon:'volley',effect:'arrow',target:true,text:'Gây 65 sát thương lên quân địch trong vùng đã chọn.'},
 heal:{name:'Hồi phục',cost:30,cooldown:22,radius:180,icon:'heal',effect:'heal',target:true,text:'Hồi 90 máu cho quân đồng minh trong vùng. Không hồi căn cứ.'},
 rally:{name:'Chiến kỳ',cost:25,cooldown:25,icon:'rally',effect:'rally',target:false,text:'Toàn quân tăng 25% sát thương và 20% tốc độ trong 8 giây.'},
 meteor:{name:'Thiên thạch',cost:60,cooldown:35,radius:145,icon:'meteor',effect:'meteor',target:true,text:'Sau 0,9 giây gây 145 sát thương vùng; 70 sát thương lên căn cứ địch.'}
};
const regions=[
 {name:'Đồng cỏ',terrain:'meadow',names:['Bờ cỏ bình minh','Cờ trên đồng xanh','Mũi thương đầu tiên','Đồi gió reo','Cửa ngõ biên cương']},
 {name:'Đèo đá',terrain:'pass',names:['Đường lên đèo','Vách đá sương mù','Tiếng cung trong gió','Trạm gác bỏ hoang','Hộ vệ đèo cao']},
 {name:'Thung lũng',terrain:'valley',names:['Thung lũng hổ phách','Dòng sông cạn','Vòng vây đỏ','Cổng đá cổ','Ngọn lửa thung lũng']},
 {name:'Pháo đài',terrain:'citadel',names:['Biên giới hoàng hôn','Bóng thành trì','Đêm trước bình minh','Lá cờ cuối cùng','Pháo đài cuối cùng']}
];
export const LEVELS=regions.flatMap((r,region)=>r.names.map((name,j)=>{
 const i=region*5+j,boss=j===4;
 return {name,region:r.name,terrain:r.terrain,boss,description:i===0?'Tuyển thêm thợ mỏ, dựng đội hình và chọn Tấn công.':boss?'Đội trưởng địch sẽ ra trận. Dùng kỹ năng và giữ đội hình.':`Vượt ${r.name.toLowerCase()}, bảo vệ thợ mỏ và phối hợp quân.`,hp:600+i*42+(boss?130:0),interval:Math.max(14.5,18-i*.17),count:i<2?1:i<8?2:3,types:i<2?['sword']:i<4?['sword','bow']:i<7?['sword','bow','shield']:i<10?['shield','bow','spear']:['shield','bow','spear','mage','sword'],startGold:320+region*30};
}));
export class Battle{
 constructor(level=0){
  this.level=Number.isInteger(level)?Math.max(0,Math.min(LEVELS.length-1,level)):0;this.config=LEVELS[this.level];
  this.gold=this.config.startGold;this.energy=60;this.time=0;this.units=[];this.projectiles=[];this.effects=[];this.corpses=[];this.pending=[];
  this.queue=[];this.order='defend';this.result=null;this.wave=0;this.enemyTimer=20;this.nextId=0;this.kills=0;this.recruited=0;this.rally=0;
  this.mine={x:375,y:408,flash:0};
  this.cooldowns=Object.fromEntries(Object.keys(SKILLS).map(k=>[k,0]));
  this.bases=[{x:120,hp:1000,max:1000,cool:0,team:0},{x:1680,hp:this.config.hp,max:this.config.hp,cool:0,team:1}];
  this.spawn('miner',0);this.spawn('miner',0);this.spawn('sword',0);this.spawn('sword',1);
 }
 get population(){return this.units.filter(u=>u.team===0&&u.hp>0).length+this.queue.length;}
 recruit(type){
  const d=TROOPS[type];if(this.result||!d||this.level<d.unlock||this.population>=30||this.queue.length>=5||this.gold<d.cost)return false;
  if(type==='miner'&&this.units.filter(u=>u.team===0&&u.type==='miner'&&u.hp>0).length+this.queue.filter(q=>q.type==='miner').length>=6)return false;
  this.gold-=d.cost;this.queue.push({type,left:d.train,total:d.train});return true;
 }
 cancelRecruit(){if(!this.queue.length||this.result)return false;const q=this.queue.pop();this.gold=Math.min(9999,this.gold+TROOPS[q.type].cost);return true;}
 spawn(type,team,elite=false){
  const d=TROOPS[type];if(!d)return null;const id=this.nextId++,factor=team?1+this.level*.009:1;
  const u={...d,type,team,id,x:team?1590:205,hp:d.hp*factor,max:d.hp*factor,damage:d.damage*factor,cool:0,mine:0,lane:id%4,walk:0,flash:0,state:'idle',animTime:0,action:null,ability:type==='miner'?24:2+id%4,barrier:0,slow:0,elite};
  if(type==='miner'){const occupied=new Set(this.units.filter(v=>v.type==='miner'&&v.team===team&&v.hp>0).map(v=>v.mineSlot));u.mineSlot=Array.from({length:6},(_,i)=>i).find(i=>!occupied.has(i))??0;u.lane=u.mineSlot<3?1:3;u.digTime=0;u.strikes=0;u.cargo=0;u.job='outbound';u.unloadLeft=0;u.facing=1;}
  if(elite){u.hp*=1.75;u.max=u.hp;u.damage*=1.25;}this.units.push(u);if(!team)this.recruited++;return u;
 }
 miningSpot(u){const slot=u.mineSlot??0;return {x:287+(slot%3)*17,y:381+u.lane*12};}
 fx(kind,x,team=0,duration=.6,extra={}){this.effects.push({kind,x,y:365,left:duration,total:duration,team,...extra});}
 setState(u,state){if(u.state!==state){u.state=state;u.animTime=0;}}
 damage(target,amount,armorIgnore=false){
  if(!target||target.hp<=0)return 0;
  const reduction=target.barrier>0?.7:armorIgnore?0:target.armor||0;
  const damage=Math.max(1,Math.round(amount*(1-reduction)));target.hp=Math.max(0,target.hp-damage);target.flash=.12;
  if(target.type&&!target.action)this.setState(target,'hit');
  this.fx(target.barrier>0?'barrier':'impact',target.x,target.team,.35,{y:355+(target.lane||0)*12});
  this.fx('text',target.x,target.team,.65,{text:'−'+damage,y:320+(target.lane||0)*12});return damage;
 }
 canCast(key){const s=SKILLS[key];return !!s&&!this.result&&this.energy>=s.cost&&this.cooldowns[key]<=0;}
 cast(key,x){
  const s=SKILLS[key];if(!this.canCast(key))return false;
  if(s.target&&(!Number.isFinite(x)||x<0||x>1800))return false;
  this.energy-=s.cost;this.cooldowns[key]=s.cooldown;
  if(key==='rally'){this.rally=8;for(const u of this.units)if(!u.team){this.fx('rally',u.x,0,1);this.setState(u,'skill');}return true;}
  if(key==='meteor'){this.fx('meteor',x,0,.9,{warning:true,radius:s.radius});this.pending.push({kind:'meteor',x,left:.9});return true;}
  if(key==='heal'){for(const u of this.units)if(u.team===0&&u.hp>0&&Math.abs(u.x-x)<=s.radius){u.hp=Math.min(u.max,u.hp+90);this.fx('heal',u.x,0,1);}}
  else for(const u of this.units)if(u.team===1&&u.hp>0&&Math.abs(u.x-x)<=s.radius)this.damage(u,65);
  this.fx(key==='heal'?'heal':'arrow',x,0,1,{radius:s.radius,area:true});return true;
 }
 attack(u,target,skill){u.action={target,left:skill?.4:.28,total:skill?.4:.28,skill};u.cool=u.rate;this.setState(u,skill?'skill':'attack');if(skill)u.ability=u.skillCD;}
 resolve(u,a){
  const living=this.units.filter(v=>v.team!==u.team&&v.hp>0),target=a.target;if(target.hp<=0)return;
  const boost=u.team===0&&this.rally>0?1.25:1;
  if(a.skill){
   if(u.type==='sword'){for(const e of living.filter(v=>Math.abs(v.x-u.x)<=100).slice(0,3))this.damage(e,36*boost);this.fx('slash',u.x,u.team,.65);}
   if(u.type==='spear'){this.damage(target,60*boost,true);this.fx('slash',target.x,u.team,.5);}
   if(u.type==='bow'){const targets=living.filter(v=>Math.abs(v.x-u.x)<=u.range).slice(0,2);if(!targets.length)targets.push(target);for(const e of targets)this.shoot(u,e,32*boost,'arrow',true);}
   if(u.type==='mage'){const targets=living.filter(v=>Math.abs(v.x-target.x)<=135);if(!targets.length)targets.push(target);for(const e of targets){this.damage(e,38*boost);if(e.type)e.slow=4;}this.fx('frost',target.x,u.team,1.1);}
   return;
  }
  if(u.type==='bow'||u.type==='mage')this.shoot(u,target,u.damage*boost,u.type==='mage'?'fireball':'arrow');
  else{if(Math.abs(u.x-target.x)<=u.range+70)this.damage(target,u.damage*boost);this.fx('slash',u.x,u.team,.35);}
 }
 shoot(u,target,damage,kind,ignore=false){this.projectiles.push({x:u.x,y:345+u.lane*12,target,team:u.team,damage,kind,ignore,age:0});}
 step(dt){
  if(this.result||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.1);this.time+=dt;this.mine.flash=Math.max(0,this.mine.flash-dt);this.energy=Math.min(100,this.energy+1.6*dt);this.rally=Math.max(0,this.rally-dt);
  for(const k of Object.keys(this.cooldowns))this.cooldowns[k]=Math.max(0,this.cooldowns[k]-dt);
  for(const p of this.pending){p.left-=dt;if(p.left<=0){for(const u of this.units)if(u.team===1&&u.hp>0&&Math.abs(u.x-p.x)<=SKILLS.meteor.radius)this.damage(u,145);if(Math.abs(this.bases[1].x-p.x)<=SKILLS.meteor.radius)this.damage(this.bases[1],70,true);this.fx('blast',p.x,0,.9);p.done=true;}}
  this.pending=this.pending.filter(p=>!p.done);
  if(this.queue.length){this.queue[0].left-=dt;if(this.queue[0].left<=0)this.spawn(this.queue.shift().type,0);}
  this.enemyTimer-=dt;
  if(this.enemyTimer<=0){this.wave++;this.enemyTimer=this.config.interval;for(let i=0;i<this.config.count+(this.wave>24?1:0);i++)if(this.units.filter(u=>u.team===1&&u.hp>0).length<24)this.spawn(this.config.types[(this.wave+i)%this.config.types.length],1,this.config.boss&&this.wave%4===0&&i===0);}
  for(const u of this.units){
   if(u.hp<=0)continue;u.animTime+=dt;u.cool-=dt;u.ability-=dt;u.flash=Math.max(0,u.flash-dt);u.barrier=Math.max(0,u.barrier-dt);u.slow=Math.max(0,u.slow-dt);
   if(u.action){u.action.left-=dt;if(u.action.left<=0){this.resolve(u,u.action);u.action=null;}continue;}
   if(u.type!=='miner'&&['attack','skill','hit'].includes(u.state)&&u.animTime<.58)continue;
   const old=u.x;
   if(u.type==='miner'){
    const spot=this.miningSpot(u),home=this.bases[u.team].x+(u.team?-36:36);
    const goal=u.job==='returning'||u.job==='unloading'?home:spot.x;
    if(u.job==='unloading'){
     this.setState(u,'idle');u.unloadLeft-=dt;
     if(u.unloadLeft<=0){const delivered=u.cargo;u.cargo=0;u.job='outbound';u.digTime=0;u.facing=u.team?-1:1;
      if(u.team===0&&delivered>0){this.gold=Math.min(9999,this.gold+delivered);this.fx('coin',home,u.team,.8);this.fx('text',home,u.team,1.2,{text:'+'+delivered,y:325});}
     }
    }else if(Math.abs(u.x-goal)>2){
     u.facing=Math.sign(goal-u.x);const speed=u.speed*(u.slow>0?.55:1)*(u.team===0&&this.rally>0?1.2:1);
     u.x+=Math.sign(goal-u.x)*Math.min(Math.abs(goal-u.x),speed*dt);
    }else if(u.job==='returning'){
     u.job='unloading';u.unloadLeft=.45;this.setState(u,'idle');
    }else{
     u.job='mining';u.facing=1;
     if(u.state==='hit'&&u.animTime<.18)continue;
     if(!(u.state==='skill'&&u.animTime<.58))this.setState(u,'dig');
     const offset=1-MINING.impactFrame/MINING.frames;
     const before=Math.floor(u.digTime/MINING.cycle+offset);u.digTime+=dt;u.mine+=dt;
     const after=Math.floor(u.digTime/MINING.cycle+offset);
     if(after>before){
      u.strikes++;this.mine.flash=.18;this.fx('impact',u.x+43,u.team,.25,{y:spot.y-33});this.fx('dust',u.x+42,u.team,.45,{y:spot.y-20});
      this.fx('ore',u.x+43,u.team,.65,{y:spot.y-29,seed:u.mineSlot});
      if(u.strikes%MINING.strikesPerPayout===0){u.cargo+=MINING.amount;u.job='returning';u.facing=-1;this.setState(u,'run');}
     }
     if(u.ability<=0){u.ability=24;u.cargo+=35;if(u.job==='mining')this.setState(u,'skill');this.fx('ore',u.x+43,u.team,.8,{y:spot.y-29,seed:u.mineSlot});}
    }
   }else{
    let nearest=null,distance=Infinity;for(const v of this.units)if(v.team!==u.team&&v.hp>0){const d=Math.abs(v.x-u.x);if(d<distance){nearest=v;distance=d;}}
    const base=this.bases[1-u.team];let target=nearest&&distance<=u.range?nearest:null;
    if(!target&&Math.abs(base.x-u.x)<=u.range+48)target=base;
    const retreat=u.team===0&&this.order==='retreat';
    if(target&&!retreat){
     this.setState(u,'idle');
     if(u.type==='shield'&&u.ability<=0){u.ability=u.skillCD;u.barrier=3;this.fx('barrier',u.x,u.team,1);this.setState(u,'skill');}
     else if(u.cool<=0)this.attack(u,target,u.type!=='shield'&&u.ability<=0);
    }else{
     let goal=nearest?nearest.x:base.x;
     if(u.team===0&&this.order!=='attack'){
      goal=this.order==='retreat'?185+u.lane*22:440+u.lane*25;
      if(nearest&&this.order==='defend'&&nearest.x<640)goal=nearest.x;
     }
     const speed=u.speed*(u.slow>0?.55:1)*(u.team===0&&this.rally>0?1.2:1);
     const delta=goal-u.x;if(Math.abs(delta)>8){let next=u.x+Math.sign(delta)*Math.min(Math.abs(delta),speed*dt);
      // Separate same-lane allies, but never prevent withdrawing through the line.
      if(!retreat)for(const ally of this.units)if(ally!==u&&ally.team===u.team&&ally.lane===u.lane&&ally.hp>0&&ally.type!=='miner'&&Math.sign(delta)*(ally.x-u.x)>0&&Math.abs(ally.x-next)<25){next=u.x;break;}
      u.x=Math.max(150,Math.min(1640,next));
     }
    }
   }
   const moved=Math.abs(old-u.x);u.walk+=moved*.13;if(moved>.01){u.dust=(u.dust||0)-dt;if(u.dust<=0){u.dust=.35;this.fx('dust',u.x,u.team,.4,{y:381+u.lane*12});}}
   if(moved>.01)this.setState(u,'run');else if(u.type!=='miner'&&u.state!=='skill')this.setState(u,'idle');
  }
  for(const p of this.projectiles){
   p.age+=dt;if(p.target.hp<=0||p.age>4){p.done=true;continue;}
   const tx=p.target.x,ty=p.target.type?345+p.target.lane*12:330;const d=Math.hypot(tx-p.x,ty-p.y),travel=(p.kind==='fireball'?330:490)*dt;
   if(d<=travel){this.damage(p.target,p.damage,p.ignore);if(p.kind==='fireball'){for(const u of this.units)if(u!==p.target&&u.team!==p.team&&u.hp>0&&Math.abs(u.x-tx)<65)this.damage(u,p.damage*.4);this.fx('blast',tx,p.team,.6);}p.done=true;}
   else{p.x+=(tx-p.x)/d*travel;p.y+=(ty-p.y)/d*travel;}
  }
  this.projectiles=this.projectiles.filter(p=>!p.done);
  for(let team=0;team<2;team++){const b=this.bases[team];b.cool-=dt;const intruder=this.units.find(u=>u.team!==team&&u.hp>0&&Math.abs(u.x-b.x)<190);if(intruder&&b.cool<=0){b.cool=1.5;this.damage(intruder,16);}}
  for(const u of this.units)if(u.hp<=0){this.corpses.push({...u,state:'death',animTime:0,action:null});if(u.team){this.kills++;this.gold=Math.min(9999,this.gold+6);}}
  this.units=this.units.filter(u=>u.hp>0);for(const c of this.corpses)c.animTime+=dt;this.corpses=this.corpses.filter(c=>c.animTime<.85);
  this.effects=this.effects.filter(e=>(e.left-=dt)>0).slice(-140);
  if(this.bases[0].hp<=0)this.result='lose';else if(this.bases[1].hp<=0)this.result='win';
 }
}
