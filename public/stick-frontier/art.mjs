import {FRAME,FRAMES,STATES,WORK_STATES,PIVOT,characterAnimation,animationFrame} from './character-layout.mjs';
export {STATES} from './character-layout.mjs';
export const FX=['slash','impact','arrow','fireball','blast','heal','rally','barrier','meteor','frost','coin','dust'];
export class ArtBank{
 constructor(){this.images=new Map();this.failed=[];}
 load(name){return new Promise(resolve=>{const image=new Image();image.onload=()=>{this.images.set(name,image);resolve(true);};image.onerror=()=>{this.failed.push(name);resolve(false);};image.src=`assets/${name}`;});}
 async ready(){const files=[];for(const t of ['miner','sword','bow','shield','spear','mage'])for(const p of ['jade','ember'])files.push(`${t}-${p}.svg`);files.push('miner-work-jade.svg','miner-work-ember.svg','miner-dig-jade.svg','miner-dig-ember.svg','gold-mine.png','effects.svg','props.svg',...['meadow','pass','valley','citadel'].map(t=>`terrain-${t}.svg`));await Promise.all(files.map(f=>this.load(f)));return !this.failed.length;}
 unit(ctx,u,x,y,size=160){const state=characterAnimation(u),work=u.type==='miner'&&WORK_STATES.includes(state);const image=this.images.get(work?`miner-work-${u.team?'ember':'jade'}.svg`:`${u.type}-${u.team?'ember':'jade'}.svg`);if(!image)return false;
 const row=Math.max(0,(work?WORK_STATES:STATES).indexOf(state));const time=state==='dig'?(u.digTime??u.animTime):u.animTime;
 const frame=animationFrame(state,time);ctx.save();ctx.translate(x,y);ctx.scale(u.facing??(u.team?-1:1),1);if(u.flash>0)ctx.globalAlpha=.72;
 ctx.drawImage(image,frame*FRAME,row*FRAME,FRAME,FRAME,-size*PIVOT[0]/FRAME,-size*PIVOT[1]/FRAME,size,size);ctx.restore();return true;}
 effect(ctx,kind,progress,x,y,size=100,team=0){const image=this.images.get('effects.svg'),row=FX.indexOf(kind);if(!image||row<0)return;const frame=Math.max(0,Math.min(7,Math.floor(progress*8)));ctx.save();ctx.translate(x,y);if(team)ctx.scale(-1,1);ctx.drawImage(image,frame*128,row*128,128,128,-size/2,-size/2,size,size);ctx.restore();}
 prop(ctx,index,x,y,size=200){const image=this.images.get('props.svg');if(!image)return;ctx.drawImage(image,index*256,0,256,256,x-size/2,y-size*.883,size,size);}
}
