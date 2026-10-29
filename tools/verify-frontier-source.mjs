// Check the complete, unclipped vector poses before trusting the packed PNGs.
import {characterFrame,characterDefs} from './frontier-character-art.mjs';
import {FRAME,FRAMES,STATES,WORK_STATES,PADDING} from '../public/stick-frontier/character-layout.mjs';
import {writeFile} from 'node:fs/promises';
const poses=[];
for(const type of ['miner','sword','bow','shield','spear','mage'])for(let team=0;team<2;team++)for(const state of [...STATES,...(type==='miner'?WORK_STATES:[])])for(let frame=0;frame<FRAMES;frame++)poses.push({type,team,state,frame,svg:characterDefs(team)+characterFrame(type,team,state,frame)});
const {chromium}=await import(process.env.FRONTIER_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.FRONTIER_CHROMIUM||undefined,args:process.env.FRONTIER_CHROMIUM?['--no-sandbox','--disable-dev-shm-usage']:[]});
try{
 const page=await browser.newPage();const failures=await page.evaluate(({poses,frameSize,padding})=>{const failures=[];for(const pose of poses){document.body.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="${frameSize*3}" height="${frameSize*3}" style="overflow:visible"><g id="probe">${pose.svg}</g></svg>`;const b=document.getElementById('probe').getBBox();if(b.x<0||b.y<0||b.x+b.width>frameSize||b.y+b.height>frameSize)failures.push({...pose,svg:undefined,bounds:[b.x,b.y,b.width,b.height]});}return failures;},{poses,frameSize:FRAME,padding:PADDING});
 console.log(`Unclipped vector source: ${poses.length} poses, ${failures.length} outside the full untrimmed cell.`);if(failures.length){console.log(JSON.stringify(failures.slice(0,12)));process.exitCode=1;}
 await writeFile(new URL('../public/stick-frontier/assets/character-source-check.json',import.meta.url),JSON.stringify({checkedFrames:poses.length,frameSize:FRAME,alphaPaddingCheckedSeparately:PADDING,failures})+'\n');
}finally{await browser.close();}
