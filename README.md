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

## Tự nghiên cứu Shopee — tiện ích 1.1.0

Cập nhật gói ZIP, giải nén thay nội dung thư mục tiện ích cũ và nhấn Reload tại `chrome://extensions` / `edge://extensions`. Bấm biểu tượng VideoDesk → **Tự tìm và nghiên cứu sản phẩm** để mở bảng điều khiển trong tab riêng.

1. Bấm **Mở Shopee để đăng nhập**, đăng nhập trực tiếp trên Shopee bằng cùng hồ sơ Chrome/Edge. Bước này không chuyển mật khẩu/cookie đến công cụ, cũng chưa xác minh được tài khoản có Shopee Affiliate hay không.
2. Chọn chủ đề (phòng trọ/góc làm việc, đồ bếp hoặc vệ sinh) và ngân sách.
3. Bấm **Bắt đầu nghiên cứu** và cấp quyền đọc `https://shopee.vn/*` nếu được hỏi. Công cụ mở một tab Shopee riêng, thực hiện 3 lượt tìm kiếm bằng từ khóa định sẵn, lấy tối đa 3 mục đầu mỗi lượt, bỏ trùng rồi đọc tối đa 9 trang chi tiết. Không gọi API ẩn hoặc tự tương tác mua hàng. Giữ tab điều khiển mở trong lúc chạy; có nút Dừng. Đóng tab điều khiển sẽ dừng việc điều phối, không tự tiếp tục khi mở lại.
4. Kết quả được xếp theo mức khớp các tiêu chí: giá lớn hơn 0 trong ngân sách +30, đánh giá từ 4,5/5 +30, số đã bán từ 100 +20. Điểm tối đa 80, không phải xác suất bán được hoặc dự báo doanh thu. Có lý do chọn, cảnh báo và trường dữ liệu thiếu bên cạnh từng món.
5. Bấm **Mở kết quả trong VideoDesk** rồi **Lưu toàn bộ kết quả** để đưa cả lượt vào bộ lọc; hoặc tải JSON. Không cần nhập từng món. Kết quả lượt đã kết thúc được lưu cục bộ trong tiện ích; không chứa thông tin đăng nhập. Mục trùng link được cập nhật, giữ hoa hồng, điểm shop, quyền tư liệu, điểm dễ quay và lựa chọn trước đó.

Chế độ này dùng `optional_host_permissions` chỉ sau khi bạn đồng ý; bản cũ chỉ đọc khi click từng trang vẫn dùng `activeTab`. Có thể thu hồi quyền Shopee trong quản lý tiện ích. Nghiên cứu dừng khi gặp đăng nhập/xác minh, trang chuyển hướng không hỗ trợ hoặc không đọc được kết quả tìm kiếm; dữ liệu đã đọc có thể xuất trước khi thử lại. Công cụ chưa có kết nối chính thức để lấy hoa hồng affiliate cá nhân, chất lượng shop, nguồn video được cấp quyền hoặc đồng bộ tài khoản.

Kiểm thử: 13 kiểm thử Node và luồng trình duyệt mô phỏng Chrome API/trang Shopee (tìm kiếm, bỏ trùng, đọc chi tiết, chấm mức phù hợp, lưu, nhập cả lượt, từ chối quyền và dừng trước màn hình đăng nhập). Môi trường vẫn chặn Shopee nên chưa xác minh chạy thành công trên tài khoản/trang Shopee thật. Không hứa đọc được mọi sản phẩm; giao diện và khả năng truy cập của sàn quyết định các trường lấy được.

## Quét một sản phẩm để đưa cho AI — tiện ích 1.2.0

Cập nhật ZIP, giải nén thay bản cũ và nhấn Reload trong quản lý tiện ích. Sau đó:

1. Mở trang sản phẩm Shopee Việt Nam, chọn biến thể mong muốn; mở mục mô tả/chi tiết nếu đang thu gọn và chờ tải xong.
2. Bấm biểu tượng VideoDesk → **Quét hồ sơ cho AI · 1 lần bấm**.
3. Tab hồ sơ tự mở: kiểm tra tên, giá, thống kê, mô tả do nhà bán cung cấp, thông số, phân loại có thể đọc được, ảnh và liên kết video nguồn. Những mục chưa đọc được được liệt kê riêng.
4. Chọn nền tảng, độ dài và đối tượng xem; bổ sung ghi chú nếu có. Nhấn **Sao chép hồ sơ + yêu cầu cho AI**, dán vào AI bạn dùng. Có thể tải Markdown/JSON hoặc đưa phần thông tin cơ bản vào bộ lọc VideoDesk.

Đầu ra chứa yêu cầu AI viết ba góc nội dung, hook, một kịch bản theo mốc thời gian, lời đọc, chữ trên màn hình, cảnh cần quay, prompt ảnh minh họa, hướng dẫn dựng dọc 9:16, caption và checklist. Tiện ích chỉ chuẩn bị dữ liệu và yêu cầu, chưa tự gọi AI hay xuất ảnh/video đã dựng. Không cần API key.

Ảnh/video là liên kết nguồn được phát hiện trên trang, không phải tệp đã tải và không tự cấp quyền sử dụng. Chỉ lấy media HTTPS từ các miền Shopee/CDN được hỗ trợ, không lấy ảnh bình luận hoặc tên người đánh giá. Ảnh lớn gần tiêu đề cần kiểm tra lại có đúng sản phẩm; liên kết có thể hết hạn. Nếu AI không tải được ảnh từ URL, bạn cần đính kèm ảnh đã lưu và được phép sử dụng. Video dạng blob/stream không có link công khai sẽ được báo chưa có.

Mô tả/thông số chỉ là thông tin nguồn, không được công cụ kiểm chứng; không suy ra hiệu quả, độ bền, trải nghiệm thật hoặc doanh thu. Bộ yêu cầu AI ghi rõ không bịa dữ liệu thiếu và bỏ qua chỉ dẫn lẫn trong văn bản trang bán hàng. Hồ sơ gần nhất được lưu cục bộ tại origin tiện ích, không gửi lên máy chủ/AI tự động; có nút xóa. Nội dung bạn sao chép/tải ra ngoài không bị xóa cùng hồ sơ.

Đã kiểm thử 14 trường hợp Node và luồng trình duyệt mô phỏng: bấm quét → lấy mô tả/thông số/biến thể/ảnh nguồn → tạo hồ sơ → đổi nền tảng/độ dài → sao chép → tải JSON → xóa. Chưa xác minh trang Shopee thật vì môi trường phát triển chặn truy cập sàn; giao diện và nội dung thực tế quyết định trường nào đọc được.
