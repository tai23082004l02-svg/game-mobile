export function videoId(value) {
  if (/^[\w-]{11}$/.test(value)) return value;
  try {
    const u = new URL(value);
    if (!['https:', 'http:'].includes(u.protocol) || !['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be'].includes(u.hostname)) return null;
    const id = u.hostname.endsWith('youtu.be') ? u.pathname.slice(1) : u.searchParams.get('v') || u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/)?.[1];
    return /^[\w-]{11}$/.test(id || '') ? id : null;
  } catch { return null; }
}

export async function findVideos(query, key, order = 'relevance', request = fetch, accessToken = '') {
  const q = query.trim();
  if (!q || q.length > 200) throw Error('Nhập từ khóa hoặc liên kết từ 1–200 ký tự.');
  const id = videoId(q);
  if (!id && /^https?:\/\//i.test(q)) throw Error('Liên kết YouTube không hợp lệ.');
  if (!key && !accessToken && id) return {
    videos: [{ id, snippet: { title: `Video YouTube · ${id}`, channelTitle: 'Chưa lấy thông tin từ YouTube', thumbnails: { medium: { url: `https://i.ytimg.com/vi/${id}/mqdefault.jpg` } } } }],
    notice: 'Đã thêm liên kết. Chưa xác minh video có xem được hay không. Nhập API key rồi tìm lại để lấy tiêu đề và số liệu.'
  };
  if (!key && !accessToken) throw Error('Đăng nhập YouTube hoặc nhập YouTube Data API key trong Cài đặt để tìm kiếm. Bạn vẫn có thể lưu liên kết video khi chưa kết nối.');
  async function yt(path, params) {
    const response = await request(`https://www.googleapis.com/youtube/v3/${path}?${new URLSearchParams({ ...params, ...(accessToken ? {} : { key }) })}`, { signal: AbortSignal.timeout(15000), ...(accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {}) });
    const data = await response.json();
    if (!response.ok) throw Error(data.error?.message || 'Không lấy được dữ liệu YouTube. Kiểm tra API key và quota.');
    return data.items || [];
  }
  let ids = id;
  if (!ids) {
    const matches = await yt('search', { part: 'snippet', type: 'video', maxResults: '12', q, order: order === 'date' ? 'date' : 'relevance' });
    ids = matches.map(v => v.id.videoId).join(',');
    if (!ids) return { videos: [] };
  }
  const videos = await yt('videos', { part: 'snippet,statistics,contentDetails', id: ids });
  if (id && !videos.length) throw Error('Không tìm thấy video công khai này.');
  return { videos };
}
