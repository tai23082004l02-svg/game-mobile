import test from 'node:test';
import assert from 'node:assert/strict';
import { findVideos, videoId } from './public/youtube.js';

test('static app adds links without credentials or network requests', async () => {
  const result = await findVideos('https://youtu.be/dQw4w9WgXcQ', '', 'date', () => { throw Error('Unexpected request'); });
  assert.equal(result.videos[0].id, 'dQw4w9WgXcQ');
  assert.match(result.notice, /Chưa xác minh/);
  assert.equal(result.videos[0].statistics, undefined);
  assert.equal(videoId('https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ'), null);
  assert.equal(videoId('ftp://youtube.com/watch?v=dQw4w9WgXcQ'), null);
  await assert.rejects(findVideos('game', ''), /API key/);
  await assert.rejects(findVideos('https://example.com/test', ''), /không hợp lệ/);
});

test('static search retrieves metadata and handles empty results and API errors', async () => {
  const calls = [];
  const request = async url => {
    const u = new URL(url); calls.push(u);
    return Response.json({ items: u.pathname.endsWith('/search') ? [{id:{videoId:'dQw4w9WgXcQ'}}] : [{id:'dQw4w9WgXcQ',snippet:{title:'Test'},statistics:{viewCount:'200'}}] });
  };
  const result = await findVideos('game design', 'test-key', 'date', request);
  assert.equal(result.videos[0].statistics.viewCount, '200');
  assert.equal(calls.length, 2);
  assert.equal(calls[0].origin, 'https://www.googleapis.com');
  assert.equal(calls[0].searchParams.get('key'), 'test-key');
  assert.equal(calls[0].searchParams.get('order'), 'date');
  assert.equal(calls[1].searchParams.get('id'), 'dQw4w9WgXcQ');
  assert.deepEqual(await findVideos('nothing', 'test-key', 'relevance', async()=>Response.json({items:[]})), {videos:[]});
  await assert.rejects(findVideos('game', 'test-key', 'date', async()=>Response.json({error:{message:'Quota exceeded'}},{status:403})), /Quota exceeded/);
  await assert.rejects(findVideos('dQw4w9WgXcQ', 'test-key', 'date', async()=>Response.json({items:[]})), /Không tìm thấy/);
});
