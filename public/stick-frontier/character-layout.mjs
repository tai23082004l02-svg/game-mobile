export const FRAME=192,FRAMES=12,PIVOT=[96,168],PADDING=16;
export const STATES=['idle','run','attack','skill','hit','death'];
export const WORK_STATES=['dig','carry','unload'];
export const DURATIONS={idle:1.5,run:.8,attack:.65,skill:.65,hit:.35,death:.85,dig:1.25,carry:.9,unload:.45};
export const STATE_NAMES={idle:'Đứng / thở',run:'Chạy',attack:'Tấn công',skill:'Kỹ năng',hit:'Trúng đòn',death:'Bị hạ',dig:'Đào vàng',carry:'Mang vàng',unload:'Giao vàng'};
export function characterAnimation(u){return u.type==='miner'?(u.job==='unloading'?'unload':u.job==='returning'&&u.cargo>0?'carry':u.state||'idle'):u.state||'idle';}
export function animationFrame(state,time){const t=Math.max(0,Number.isFinite(time)?time:0)/(DURATIONS[state]||DURATIONS.idle);return ['idle','run','dig','carry'].includes(state)?Math.floor(t*FRAMES)%FRAMES:Math.min(FRAMES-1,Math.floor(t*FRAMES));}
