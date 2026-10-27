import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('./public/', import.meta.url);
export function videoId(value) {
  if (/^[\w-]{11}$/.test(value)) return value;
  try {
    const u = new URL(value);
    if (!['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be'].includes(u.hostname)) return null;
    const id = u.hostname.endsWith('youtu.be') ? u.pathname.slice(1) : u.searchParams.get('v') || u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/)?.[1];
    return /^[\w-]{11}$/.test(id || '') ? id : null;
  } catch { return null; }
}
async function getJson(url, headers = {}) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'YouTube không trả về dữ liệu. Kiểm tra liên kết hoặc thử lại.');
  return data;
}
export const server = http.createServer(async (req, res) => {
  const send = (status, data) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); };
  try {
    const url = new URL(req.url, 'http://localhost');
    if (req.method !== 'GET') return send(405, { error: 'Method not allowed' });
    if (url.pathname.startsWith('/api/')) {
      const key = req.headers['x-youtube-key'] || process.env.YOUTUBE_API_KEY;
      const yt = (path, params) => getJson(`https://www.googleapis.com/youtube/v3/${path}?${new URLSearchParams(params)}`, { 'X-Goog-Api-Key': key });
      if (url.pathname === '/api/video') {
        const id = videoId(url.searchParams.get('url') || '');
        if (!id) return send(400, { error: 'Liên kết hoặc ID YouTube không hợp lệ.' });
        if (!key) {
          const data = await getJson(`https://www.youtube.com/oembed?${new URLSearchParams({ url: `https://www.youtube.com/watch?v=${id}`, format: 'json' })}`);
          return send(200, { videos: [{ id, snippet: { title: data.title, channelTitle: data.author_name, thumbnails: { medium: { url: data.thumbnail_url } } } }] });
        }
        const data = await yt('videos', { part: 'snippet,statistics,contentDetails', id });
        if (!data.items?.length) return send(404, { error: 'Không tìm thấy video công khai này.' });
        return send(200, { videos: data.items });
      }
      if (url.pathname === '/api/search') {
        if (!key) return send(400, { error: 'Hãy nhập YouTube Data API key trong phần Cài đặt để tìm kiếm.' });
        const q = (url.searchParams.get('q') || '').trim();
        if (!q || q.length > 200) return send(400, { error: 'Nhập từ khóa từ 1–200 ký tự.' });
        const results = await yt('search', { part: 'snippet', type: 'video', maxResults: '12', q, order: url.searchParams.get('order') === 'date' ? 'date' : 'relevance' });
        if (!results.items?.length) return send(200, { videos: [] });
        const data = await yt('videos', { part: 'snippet,statistics,contentDetails', id: results.items.map(x => x.id.videoId).join(',') });
        return send(200, { videos: data.items || [] });
      }
      return send(404, { error: 'Not found' });
    }
    const files = { '/': ['index.html', 'text/html'], '/app.js': ['app.js', 'text/javascript'], '/auth.js': ['auth.js', 'text/javascript'], '/youtube.js': ['youtube.js', 'text/javascript'], '/style.css': ['style.css', 'text/css'] };
    const file = files[url.pathname];
    if (!file) return send(404, { error: 'Not found' });
    res.writeHead(200, { 'Content-Type': `${file[1]}; charset=utf-8`, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
    res.end(await readFile(new URL(file[0], root)));
  } catch (error) { send(502, { error: error.name === 'TimeoutError' ? 'YouTube phản hồi quá lâu. Vui lòng thử lại.' : error.message }); }
});
if (process.argv[1] === fileURLToPath(import.meta.url)) server.listen(Number(process.env.PORT || 3000), '127.0.0.1', () => console.log('YouTube Workbench: http://localhost:3000'));
