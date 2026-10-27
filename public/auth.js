const scope = 'https://www.googleapis.com/auth/youtube.readonly';
export function setupAuth({ loginButton, logoutButton, status, clientInput, onChange }) {
  let token = '', expiresAt = 0, timer, generation = 0;
  function clear(message = 'Chưa kết nối tài khoản YouTube.') {
    generation++;
    token = ''; expiresAt = 0; clearTimeout(timer);
    logoutButton.hidden = true; loginButton.hidden = false;
    loginButton.disabled = false; status.textContent = message; onChange('');
  }
  function currentToken() {
    if (token && Date.now() >= expiresAt) clear('Phiên kết nối hết hạn. Hãy đăng nhập lại.');
    return token;
  }
  loginButton.onclick = () => {
    const clientId = clientInput.value.trim();
    if (!/^[\w.-]+\.apps\.googleusercontent\.com$/.test(clientId)) {
      status.textContent = 'Mở Cài đặt kết nối và nhập OAuth Client ID loại Web application trước khi đăng nhập.';
      return;
    }
    const oauth = globalThis.google?.accounts?.oauth2;
    if (!oauth) { status.textContent = 'Chưa tải được đăng nhập Google. Kiểm tra mạng hoặc trình chặn nội dung rồi tải lại trang.'; return; }
    const attempt = ++generation;
    loginButton.disabled = true;
    status.textContent = 'Hoàn tất đăng nhập trong cửa sổ Google…';
    const fail = message => { if (attempt === generation) clear(message); };
    try {
      const client = oauth.initTokenClient({
        client_id: clientId, scope, include_granted_scopes: false,
        error_callback: () => fail('Cửa sổ đăng nhập đã đóng hoặc bị chặn. Hãy mở trang bằng Chrome/Safari rồi thử lại.'),
        callback: async response => {
          if (attempt !== generation) return;
          if (response.error || !response.access_token || !oauth.hasGrantedAllScopes(response, scope)) {
            fail('Chưa cấp quyền đọc YouTube. Bạn có thể đăng nhập lại hoặc dùng API key.'); return;
          }
          const seconds = Number(response.expires_in);
          if (!Number.isFinite(seconds) || seconds <= 0) { fail('Phiên Google không hợp lệ. Hãy thử lại.'); return; }
          token = response.access_token; expiresAt = Date.now() + seconds * 1000;
          timer = setTimeout(() => clear('Phiên kết nối hết hạn. Hãy đăng nhập lại.'), seconds * 1000);
          loginButton.hidden = true; loginButton.disabled = false; logoutButton.hidden = false;
          status.textContent = 'Đã kết nối YouTube · quyền chỉ đọc.'; onChange(token);
          try {
            const result = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000) });
            const data = await result.json();
            if (attempt !== generation) return;
            if (!result.ok) { if (result.status === 401) clear('Phiên không còn hợp lệ. Hãy đăng nhập lại.'); else status.textContent = 'Đã kết nối Google, nhưng chưa đọc được kênh. Kiểm tra YouTube Data API v3 và quyền truy cập.'; return; }
            status.textContent = data.items?.[0]?.snippet?.title ? `Đã kết nối: ${data.items[0].snippet.title} · chỉ đọc` : 'Đã kết nối Google · tài khoản chưa có kênh YouTube.';
          } catch { if (attempt === generation) status.textContent = 'Đã kết nối Google; chưa tải được thông tin kênh. Bạn có thể thử tìm kiếm.'; }
        }
      });
      client.requestAccessToken({ prompt: 'select_account' });
    } catch { fail('Không khởi tạo được đăng nhập. Kiểm tra OAuth Client ID và tên miền đã đăng ký.'); }
  };
  logoutButton.onclick = () => {
    const previous = token;
    clear('Đã ngắt kết nối. Danh sách lưu trên máy vẫn được giữ.');
    if (previous) {
      try { globalThis.google.accounts.oauth2.revoke(previous, response => {
        if (response?.error && !token) status.textContent = 'Đã xóa phiên trên trang. Bạn có thể thu hồi quyền tại myaccount.google.com/connections.';
      }); } catch { status.textContent = 'Đã xóa phiên trên trang. Bạn có thể thu hồi quyền tại myaccount.google.com/connections.'; }
    }
  };
  return { currentToken };
}
