# VideoDesk — YouTube trên điện thoại

Ứng dụng web tĩnh tiếng Việt chạy trên GitHub Pages, không cần máy chủ hoặc cài Node.js trên điện thoại. Giao diện tự điều chỉnh cho màn hình nhỏ.

## Xuất bản trên GitHub Pages

1. Đưa mã nguồn lên nhánh `main` của kho này.
2. Trong GitHub, mở **Settings → Pages → Build and deployment → Source**, chọn **GitHub Actions**.
3. Workflow **Deploy VideoDesk to GitHub Pages** chạy khi có commit trên `main`. Nếu cần, mở **Actions** và chạy workflow thủ công bằng **Run workflow**.
4. Khi deployment thành công, mở https://tai23082004l02-svg.github.io/game-mobile/ trên Chrome hoặc Safari của điện thoại. Có thể dùng **Thêm vào màn hình chính** trong menu trình duyệt. Ứng dụng cần Internet.

Workflow chỉ xuất bản thư mục `public`. Các đường dẫn tương đối hỗ trợ đường dẫn con `/game-mobile/`.

## Tìm kiếm và phân tích

- Không có API key: dán liên kết YouTube để tạo mục video, lưu danh sách và mở trên YouTube. Chưa lấy tiêu đề thật, thống kê hoặc xác minh video còn truy cập được.
- Có API key: tìm theo từ khóa, lấy tiêu đề, kênh, ngày đăng, mô tả, lượt xem, thích, bình luận và tỷ lệ tương tác `(thích + bình luận) / lượt xem`. Không phân tích âm thanh, hình ảnh, transcript, retention hoặc doanh thu.
- Tạo API key trong Google Cloud Console, bật **YouTube Data API v3**. Trong **Application restrictions → Websites (HTTP referrers)** cho phép `https://tai23082004l02-svg.github.io/*`; trong **API restrictions** chỉ cho phép **YouTube Data API v3**. Sau đó nhập key ở **Cài đặt API** của ứng dụng. Với website dùng tên miền riêng, thêm đúng tên miền đó.
- API key chỉ giữ trong bộ nhớ tab, mất khi tải lại trang; không ghi vào mã nguồn, localStorage hoặc tệp xuất. Bản Pages gọi API trực tiếp từ trình duyệt nên key có thể thấy trong công cụ mạng của chính người dùng. Dùng key dành cho web với các giới hạn nói trên. Không nhập OAuth token. Google áp dụng quota cho tìm kiếm và đọc dữ liệu.
- Danh sách lưu trong localStorage của trình duyệt và website hiện tại, không đồng bộ tự động giữa máy tính và điện thoại. Dùng **Xuất JSON / Nhập JSON** để chuyển hoặc sao lưu. Dữ liệu đã lưu là ảnh chụp tại lúc lấy; tìm lại video để cập nhật.
- **Mở trên YouTube** mở video để bạn tự đăng nhập, xem, thích hoặc bình luận; ứng dụng không tự động tương tác.

## Phát triển cục bộ

Node.js 22+: chạy `npm start`, mở http://localhost:3000. Windows có thể mở `start-windows.bat`. Hoặc phục vụ thư mục `public` bằng bất kỳ máy chủ tĩnh nào. Không cần cài thư viện ngoài. Giao diện gọi Google trực tiếp và dùng key nhập trong tab.

`npm test` kiểm tra luồng tìm kiếm tĩnh bằng API giả lập, lỗi quota, thêm liên kết không key, xử lý URL và HTTP cục bộ. Kiểm tra tìm kiếm thật cần key hợp lệ và quota. Các miền cần dùng: `www.googleapis.com`, `i.ytimg.com`, `www.youtube.com`.

## Đăng nhập Google / kết nối YouTube

Website dùng Google Identity Services, xin duy nhất quyền `youtube.readonly` để đọc tên kênh và tìm kiếm bằng phiên được cấp quyền. Không nhận mật khẩu, không tự thích, đăng bình luận, đăng ký kênh hoặc thay đổi tài khoản. Phiên kết nối của ứng dụng khác phiên đăng nhập trên youtube.com; mở video trên YouTube để tương tác trực tiếp.

Chủ website cần cấu hình một lần trong Google Cloud (không thể bật OAuth chỉ bằng mã GitHub Pages):

1. Bật **YouTube Data API v3** cho dự án.
2. Trong **Google Auth Platform**, cấu hình Branding, Audience và Data Access cho quyền `https://www.googleapis.com/auth/youtube.readonly`. Nếu ứng dụng ở trạng thái Testing, thêm địa chỉ Google của người dùng vào Test users. Đưa ứng dụng cho người dùng rộng rãi có thể cần Google xác minh quyền nhạy cảm.
3. Tạo **OAuth Client ID → Web application**. Thêm **Authorized JavaScript origins**: `https://tai23082004l02-svg.github.io` (không thêm `/game-mobile/`). Để thử cục bộ thêm `http://localhost:3000`. Luồng popup token không cần redirect URI phía máy chủ.
4. Trên VideoDesk mở **Cài đặt kết nối**, dán Client ID có đuôi `.apps.googleusercontent.com`, nhấn **Áp dụng**, sau đó **Đăng nhập Google**. Client ID là công khai; tuyệt đối không nhập Client Secret. Cho phép popup và sử dụng Chrome/Safari thay vì trình duyệt nhúng trong ứng dụng nhắn tin nếu Google chặn đăng nhập.

Access token chỉ nằm trong bộ nhớ tab, không ghi localStorage hoặc tệp xuất; hết hạn hoặc tải lại trang thì cần đăng nhập lại. Client ID công khai được lưu tại trình duyệt để không phải nhập lại. Khi ngắt kết nối, ứng dụng xóa token ngay và yêu cầu Google thu hồi quyền. Có thể quản lý quyền tại https://myaccount.google.com/connections. Danh sách video vẫn là dữ liệu cục bộ, không được đồng bộ lên tài khoản Google.

Chưa có OAuth Client ID hợp lệ thì nút đăng nhập sẽ hướng dẫn cấu hình; tìm kiếm bằng API key và lưu liên kết vẫn dùng được. Kiểm thử tự động mô phỏng đăng nhập/cấp quyền/ngắt kết nối; đăng nhập thật cần Client ID và tài khoản test được cấu hình như trên.

## Bộ lọc sản phẩm affiliate

Mở mục **Lọc sản phẩm** hoặc `products.html` trên Pages. Không cần đăng nhập/API key cho tính năng này. Công cụ không tự truy cập TikTok Shop, Shopee hoặc xác minh dữ liệu của shop.

- Thêm/sửa từng sản phẩm hoặc nhập danh sách CSV/JSON tối đa 2.000 mục, 5 MB. Tải mẫu CSV và giữ nguyên tên cột. Dữ liệu nhập do người dùng cung cấp; file CSV xuất từ sàn có thể cần đổi tên cột/chuẩn hóa trước khi nhập.
- Lọc theo giá, % hoa hồng, điểm sản phẩm/shop, số đã bán, nền tảng, nhóm hàng, mức dễ làm video tự chấm và quyền sử dụng tư liệu tự xác nhận. Bộ lọc bỏ qua sản phẩm thiếu số liệu đang được xét; để trống ngưỡng để không xét. Preset người mới chỉ là ngưỡng tham khảo, không dự báo hiệu quả bán.
- Sắp xếp theo hoa hồng ước tính/đơn, % hoa hồng, đánh giá, số đã bán hoặc mức dễ làm video. Hoa hồng ước tính bằng giá × % hoa hồng, chưa xét hoàn đơn, thuế hoặc điều kiện/giới hạn chiến dịch.
- Đánh dấu **Chọn** để tạo danh sách ngắn, xuất các mục đã chọn sang CSV. **Sao lưu tất cả** tải JSON, giữ cả trạng thái lựa chọn khi nhập lại. Dữ liệu lưu trên trình duyệt hiện tại, không tự đồng bộ.
- Khi nhập, liên kết giống hệt đã tồn tại được bỏ qua; mục không có liên kết vẫn được thêm. Kiểm tra số kỳ doanh số và thang điểm trước khi so sánh, không trộn số toàn thời gian với số 30 ngày.

Các cột CSV: `name,platform,category,url,price,commission,rating,sold,shopRating,demo,rights`. Chỉ `name` bắt buộc. Giá là VND không có dấu phân cách; `commission=10` là 10%; điểm từ 0–5; `sold` là số nguyên; `demo` từ 1–5; `rights` là `yes`, `no`, `unknown`. Ô trống là chưa biết. CSV dùng dấu phẩy ngăn cột và dấu chấm thập phân, UTF-8.

## Lấy sản phẩm Shopee trên laptop

VideoDesk có tiện ích Chrome/Edge đóng gói sẵn tại `public/videodesk-shopee-extension.zip`. Trên trang **Lọc sản phẩm**, mở **Cài tiện ích lấy sản phẩm** để tải ZIP và xem hướng dẫn. Giải nén, mở `chrome://extensions` hoặc `edge://extensions`, bật Developer mode, chọn Load unpacked rồi chọn thư mục có `manifest.json`. Khi có bản cập nhật tiện ích, tải lại ZIP, thay nội dung thư mục và nhấn Reload trong trang quản lý tiện ích.

Luồng sử dụng:

1. Dán link sản phẩm đầy đủ vào VideoDesk và bấm **Mở sản phẩm**, hoặc mở trực tiếp sản phẩm Shopee Việt Nam.
2. Đăng nhập/xác minh trực tiếp trên Shopee nếu được yêu cầu; chọn biến thể và chờ trang tải xong.
3. Bấm biểu tượng tiện ích VideoDesk → **Lấy thông tin trang đang mở**. Chọn website GitHub Pages hoặc máy chủ laptop (`localhost:3000`).
4. Tiện ích mở VideoDesk với bản nháp: kiểm tra giá/biến thể, tên, đánh giá, số đã bán; bổ sung hoa hồng và quyền tư liệu rồi nhấn Lưu. Nếu sản phẩm đã có, trình soạn thảo mở bản cập nhật và giữ lại các trường bạn đã tự chấm/nhập.

Tiện ích chỉ có quyền `activeTab` và `scripting`, chạy khi người dùng bấm, không có quyền đọc cookie hay crawl nền. Không gọi API ẩn, không vượt đăng nhập/captcha, không lấy hoa hồng tài khoản hoặc tự tạo link affiliate. Chỉ đọc tiêu đề, dữ liệu sản phẩm có cấu trúc và văn bản trang đang mở; giao diện đăng nhập hoặc trang không phải chi tiết sản phẩm sẽ báo lỗi. Cách hiển thị Shopee có thể thay đổi, khiến trường dữ liệu không đọc được: khi đó nhập thủ công. Giá có nhiều mức không rõ ràng được để trống; doanh số viết tắt được ghi chú xấp xỉ và chưa xác định kỳ thống kê. Điểm shop và quyền tư liệu không tự điền.

Bản nháp đi qua URL fragment (không phải query gửi máy chủ); VideoDesk xóa fragment khi đọc và chỉ lưu sau khi bạn xác nhận. Chỉ thông tin sản phẩm cùng thời điểm và ghi chú thu thập được chuyển; không có mật khẩu/token/cookie. Mốc thời gian và ghi chú giữ trong bản sao lưu JSON, không có trong mẫu CSV hiện tại.

Môi trường phát triển hiện không được phép truy cập Shopee, nên kiểm thử bộ đọc dùng trang/dữ liệu mô phỏng, chưa khẳng định đọc thành công mọi sản phẩm thật. GitHub Pages vẫn không tự fetch Shopee chỉ từ URL: cần tiện ích trên trình duyệt của người dùng. Bản này hỗ trợ link đầy đủ `shopee.vn/product/shopId/itemId` và đường dẫn `...-i.shopId.itemId`; link rút gọn cần mở ra trước.

Đóng gói lại khi sửa tiện ích (Python 3, chạy từ thư mục kho mã):

```python
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
with ZipFile('public/videodesk-shopee-extension.zip', 'w', ZIP_DEFLATED) as archive:
    for path in sorted(Path('public/extension').iterdir()):
        if path.is_file():
            archive.write(path, path.name)
```
