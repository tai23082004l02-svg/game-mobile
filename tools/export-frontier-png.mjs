// Optional PNG export. Requires Playwright (or playwright-core + Chromium).
// FRONTIER_PLAYWRIGHT_MODULE may select an installed Playwright module.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const assets=join(root,'public/stick-frontier/assets'),out=join(root,'work/frontier-png');await mkdir(out,{recursive:true});
const {chromium}=await import(process.env.FRONTIER_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.FRONTIER_CHROMIUM||undefined,args:process.env.FRONTIER_CHROMIUM?['--no-sandbox','--disable-dev-shm-usage']:[]});
try{
 const page=await browser.newPage();
 const manifest=JSON.parse(await readFile(join(assets,'manifest.json'),'utf8'));
 const files=[...Object.values(manifest.mining.files),...Object.values(manifest.units).flatMap(Object.values),'effects.svg','props.svg','icons.svg',...Object.values(manifest.environment),...Object.keys(manifest.units).map(k=>`portrait-${k}.svg`)];
 for(const file of files){const source=await readFile(join(assets,file),'utf8');const data=await page.evaluate(async svg=>{const image=new Image();const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url;});const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;c.getContext('2d').drawImage(image,0,0);const data=c.toDataURL('image/png').split(',')[1];URL.revokeObjectURL(url);return data;},source);await writeFile(join(out,file.replace('.svg','.png')),Buffer.from(data,'base64'));}
 for(const name of ['miner-dig-jade.png','miner-dig-ember.png'])await writeFile(join(assets,name),await readFile(join(out,name)));
 console.log(`Exported ${files.length} transparent PNG files to work/frontier-png.`);
}finally{await browser.close();}
