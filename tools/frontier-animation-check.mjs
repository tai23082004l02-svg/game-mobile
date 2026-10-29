// Exhaustive studio checks for every class, faction and animation, including frame visibility.
import {STATES,WORK_STATES,STATE_NAMES} from '../public/stick-frontier/character-layout.mjs';
import {TROOPS} from '../public/stick-frontier/engine.mjs';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {chromium}=await import(process.env.FRONTIER_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.FRONTIER_CHROMIUM||undefined,args:process.env.FRONTIER_CHROMIUM?['--no-sandbox','--disable-dev-shm-usage']:[]});
const page=await browser.newPage({viewport:{width:915,height:412},isMobile:true,hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(process.argv[2]||'http://127.0.0.1:3000/stick-frontier/');await page.waitForFunction(()=>document.getElementById('load-status').textContent.includes('sẵn sàng'));await page.locator('#open-art').click();let checked=0;
 for(const type of Object.keys(TROOPS))for(const team of ['0','1']){
  await page.selectOption('#art-type',type);await page.selectOption('#art-team',team);
  for(const state of [...STATES,...(type==='miner'?WORK_STATES:[])]){
   await page.selectOption('#art-state',state);await page.waitForFunction(label=>document.getElementById('art-frame').textContent.startsWith(label.toUpperCase()),STATE_NAMES[state]);
   assert.equal(await page.locator('#art-sheet').getAttribute('src'),`assets/${WORK_STATES.includes(state)?'miner-work':type}-${team==='0'?'jade':'ember'}.svg`);
   const visible=await page.evaluate(()=>{const c=document.getElementById('art-canvas'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let ink=0,edge=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){if(d[(y*c.width+x)*4+3]){ink++;if(x===0||y===0||x===c.width-1||y===c.height-1)edge++;}}return {ink,edge};});
   assert.ok(visible.ink>100);assert.equal(visible.edge,0,`${type}/${team}/${state} preview clipped`);checked++;
  }
 }
 await page.selectOption('#art-type','miner');await page.selectOption('#art-state','carry');const pending=page.waitForEvent('download');await page.locator('#sheet-png').click();const d=await pending;assert.equal(d.suggestedFilename(),'miner-work-ember.png');const png=await readFile(await d.path());assert.equal(png.readUInt32BE(16),2304);assert.equal(png.readUInt32BE(20),576);assert.deepEqual(errors,[]);
 console.log(`PASS: ${checked} studio combinations, visible uncut previews, correct sheets, worker PNG 2304×576, no browser errors.`);
}finally{await browser.close();}
