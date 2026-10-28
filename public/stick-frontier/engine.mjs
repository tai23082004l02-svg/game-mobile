export const TROOPS = {
  miner: {name:'Thợ mỏ', cost:60, hp:65, speed:35, damage:0, range:0, rate:1},
  sword: {name:'Kiếm sĩ', cost:90, hp:125, speed:54, damage:21, range:42, rate:0.85},
  bow: {name:'Cung thủ', cost:130, hp:70, speed:43, damage:16, range:235, rate:1.25},
  shield: {name:'Hộ vệ', cost:170, hp:310, speed:30, damage:17, range:48, rate:1.15}
};
export const LEVELS = [
  {name:'Bờ cỏ bình minh', description:'Dựng đội quân đầu tiên. Kiếm sĩ mở đường, cung thủ hỗ trợ.', hp:550, interval:15, count:1, types:['sword']},
  {name:'Đèo gió', description:'Cung thủ địch đã xuất hiện. Hãy dùng hộ vệ che chắn.', hp:700, interval:14, count:2, types:['sword','bow']},
  {name:'Thung lũng hổ phách', description:'Địch có lính giáp dày. Đầu tư thợ mỏ để duy trì viện quân.', hp:850, interval:13, count:2, types:['shield','bow','sword']},
  {name:'Biên giới hoàng hôn', description:'Những đợt quân đông hơn. Giữ đội hình trước khi phản công.', hp:1000, interval:13, count:3, types:['sword','bow','shield']},
  {name:'Pháo đài cuối cùng', description:'Phá hủy thành trì và giành lại toàn bộ vùng biên.', hp:1250, interval:12, count:3, types:['shield','bow','sword','bow']}
];
export class Battle {
  constructor(level=0) {
    this.level=Math.max(0,Math.min(4,level)); this.config=LEVELS[this.level];
    this.gold=300; this.time=0; this.units=[]; this.projectiles=[]; this.effects=[];
    this.queue=[]; this.order='defend'; this.result=null; this.wave=0; this.enemyTimer=18;
    this.bases=[{x:120,hp:850,max:850,cool:0},{x:1680,hp:this.config.hp,max:this.config.hp,cool:0}];
    this.nextId=0; this.spawn('miner',0); this.spawn('miner',0);
    this.spawn('sword',1); this.spawn('sword',0);
  }
  get population(){return this.units.filter(u=>u.team===0&&u.hp>0).length+this.queue.length;}
  recruit(type){
    if(this.result||!TROOPS[type]) return false;
    const miners=this.units.filter(u=>u.team===0&&u.type==='miner').length+this.queue.filter(q=>q.type==='miner').length;
    if(this.population>=30||this.queue.length>=5||this.gold<TROOPS[type].cost||(type==='miner'&&miners>=6))return false;
    this.gold-=TROOPS[type].cost; this.queue.push({type,left:type==='shield'?3.2:2}); return true;
  }
  spawn(type,team){
    const def=TROOPS[type],id=this.nextId++;
    const u={...def,type,team,id,x:team?1590:205,hp:def.hp,max:def.hp,cool:0,mine:0,lane:id%4,walk:0,flash:0};
    this.units.push(u);return u;
  }
  hit(target,damage){target.hp-=damage;target.flash=0.12;this.effects.push({x:target.x,y:target.lane===undefined?320:365+target.lane*15,left:0.6,text:'−'+damage});}
  step(dt){
    if(this.result||!Number.isFinite(dt)||dt<=0)return;
    dt=Math.min(dt,0.1); this.time+=dt;
    this.gold=Math.min(9999,this.gold+2*dt);
    if(this.queue.length){this.queue[0].left-=dt;if(this.queue[0].left<=0)this.spawn(this.queue.shift().type,0);}
    this.enemyTimer-=dt;
    if(this.enemyTimer<=0){this.wave++;this.enemyTimer=this.config.interval;for(let i=0;i<this.config.count+(this.wave>7?1:0);i++)if(this.units.filter(u=>u.team===1).length<24)this.spawn(this.config.types[(this.wave+i)%this.config.types.length],1);}
    for(const u of this.units){
      if(u.hp<=0)continue;u.cool-=dt;u.flash=Math.max(0,u.flash-dt);const old=u.x;
      if(u.type==='miner'){
        const goal=285+u.lane*13;
        if(Math.abs(u.x-goal)>3)u.x+=Math.sign(goal-u.x)*u.speed*dt;
        else{u.mine+=dt;if(u.mine>=5){u.mine-=5;this.gold=Math.min(9999,this.gold+22);this.effects.push({x:u.x,y:350,left:1,text:'+22 vàng'});}}
      }else{
        const enemies=this.units.filter(v=>v.team!==u.team&&v.hp>0);
        const nearest=enemies.sort((a,b)=>Math.abs(a.x-u.x)-Math.abs(b.x-u.x))[0];
        const base=this.bases[1-u.team];
        let target=nearest&&Math.abs(nearest.x-u.x)<=u.range?nearest:null;
        if(!target&&Math.abs(base.x-u.x)<=u.range+48)target=base;
        const retreat=u.team===0&&this.order==='retreat';
        if(target&&!retreat){
          if(u.cool<=0){u.cool=u.rate;
            if(u.type==='bow')this.projectiles.push({x:u.x,y:345+u.lane*15,target,team:u.team,damage:u.damage});
            else this.hit(target,u.damage);
          }
        }else{
          let goal=u.team?140:1640;
          if(u.team===0&&this.order!=='attack'){
            goal=this.order==='retreat'?185+u.lane*14:470+u.lane*19;
            if(nearest&&this.order==='defend'&&nearest.x<700)goal=nearest.x;
          }
          if(Math.abs(goal-u.x)>8)u.x+=Math.sign(goal-u.x)*u.speed*dt;
        }
      }
      u.walk+=Math.abs(old-u.x)*0.13;
    }
    for(const p of this.projectiles){
      const tx=p.target.x,ty=p.target.lane===undefined?340:345+p.target.lane*15;
      const distance=Math.hypot(tx-p.x,ty-p.y),travel=440*dt;
      if(distance<=travel){if(p.target.hp>0)this.hit(p.target,p.damage);p.done=true;}
      else{p.x+=(tx-p.x)/distance*travel;p.y+=(ty-p.y)/distance*travel;}
    }
    this.projectiles=this.projectiles.filter(p=>!p.done);
    for(let team=0;team<2;team++){
      const b=this.bases[team];b.cool-=dt;
      const intruder=this.units.find(u=>u.team!==team&&u.hp>0&&Math.abs(u.x-b.x)<190);
      if(intruder&&b.cool<=0){b.cool=1.5;this.hit(intruder,12);}
    }
    this.units=this.units.filter(u=>u.hp>0);this.effects=this.effects.filter(e=>(e.left-=dt)>0);
    if(this.bases[0].hp<=0)this.result='lose';else if(this.bases[1].hp<=0)this.result='win';
  }
}
