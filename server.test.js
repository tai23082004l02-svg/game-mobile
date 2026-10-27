import test from 'node:test';
import assert from 'node:assert/strict';
import { server, videoId } from './server.js';

test('accepts supported YouTube URLs and rejects foreign hosts or invalid IDs', () => {
  const id='dQw4w9WgXcQ';
  for (const value of [id,`https://www.youtube.com/watch?v=${id}&t=10`,`https://youtu.be/${id}`,`https://www.youtube.com/shorts/${id}`,`https://www.youtube.com/live/${id}`]) assert.equal(videoId(value),id);
  for (const value of ['https://evil.com/watch?v='+id,'https://youtube.com.evil.com/watch?v='+id,'file:///etc/passwd','bad','https://youtu.be/short']) assert.equal(videoId(value),null);
});
test('serves app and validates API requests without external access', async () => {
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try {
    const base=`http://127.0.0.1:${server.address().port}`;
    const page=await fetch(base); assert.equal(page.status,200); assert.match(await page.text(),/YouTube Workbench/);
    for(const path of ['/app.js','/style.css']) assert.equal((await fetch(base+path)).status,200);
    const invalid=await fetch(base+'/api/video?url=https://evil.com'); assert.equal(invalid.status,400);assert.match((await invalid.json()).error,/không hợp lệ/);
    assert.equal((await fetch(base+'/missing')).status,404);
    assert.equal((await fetch(base,{method:'POST'})).status,405);
    const originalFetch = globalThis.fetch;
    const calls = [];
    globalThis.fetch = async (url, options) => {
      if (String(url).startsWith(base)) return originalFetch(url, options);
      calls.push({ url: new URL(url), options });
      if (String(url).includes('/search?')) return Response.json({items:[{id:{videoId:'dQw4w9WgXcQ'}}]});
      if (String(url).includes('/videos?')) return Response.json({items:[{id:'dQw4w9WgXcQ',snippet:{title:'Example'},statistics:{viewCount:'100'}}]});
      return Response.json({title:'Example',author_name:'Channel',thumbnail_url:'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg'});
    };
    try {
      const search=await originalFetch(base+'/api/search?q=game',{headers:{'X-YouTube-Key':'test-key'}});
      assert.equal(search.status,200);
      assert.equal((await search.json()).videos[0].statistics.viewCount,'100');
      assert.equal(calls[0].url.searchParams.get('q'),'game');
      assert.equal(calls[0].options.headers['X-Goog-Api-Key'],'test-key');
      assert.equal(calls[1].url.searchParams.get('id'),'dQw4w9WgXcQ');
      globalThis.fetch=async (url,options)=>String(url).startsWith(base)?originalFetch(url,options):Response.json({error:{message:'Quota exceeded'}},{status:403});
      const denied=await originalFetch(base+'/api/search?q=game',{headers:{'X-YouTube-Key':'test-key'}});
      assert.equal(denied.status,502);assert.equal((await denied.json()).error,'Quota exceeded');
    } finally {globalThis.fetch=originalFetch;}
  } finally {await new Promise(resolve=>server.close(resolve));}
});
