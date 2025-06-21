# 🔧 Hướng dẫn khắc phục lỗi Flux API

## 🚨 Lỗi phổ biến và cách khắc phục

### 1. **"API key không hợp lệ" (401 Error)**

**Nguyên nhân:**
- API key sai hoặc đã hết hạn
- API key không đúng định dạng

**Khắc phục:**
1. Kiểm tra API key phải bắt đầu bằng `bfl-`
2. Lấy API key mới tại: https://api.bfl.ml/
3. Tạo file `.env.local` và thêm:
   ```
   FLUX_API_KEY=bfl-your_actual_api_key_here
   ```

### 2. **"Không đủ credits" (402 Error)**

**Nguyên nhân:**
- Tài khoản hết credits

**Khắc phục:**
1. Truy cập https://api.bfl.ml/
2. Mua thêm credits cho tài khoản
3. Kiểm tra balance trước khi sử dụng

### 3. **"Quá nhiều yêu cầu" (429 Error)**

**Nguyên nhân:**
- Vượt quá rate limit

**Khắc phục:**
1. Đợi vài phút trước khi thử lại
2. Giảm tần suất gọi API
3. Implement retry logic với delay

### 4. **"Lỗi server" (500/502/503 Error)**

**Nguyên nhân:**
- Server Flux API đang gặp sự cố

**Khắc phục:**
1. Thử lại sau vài phút
2. Kiểm tra status của Flux API
3. Liên hệ support nếu lỗi kéo dài

### 5. **"Không thể kết nối"**

**Nguyên nhân:**
- Lỗi mạng hoặc firewall

**Khắc phục:**
1. Kiểm tra kết nối internet
2. Thử đổi DNS (8.8.8.8)
3. Kiểm tra firewall/proxy

---

# 🤖 Hướng dẫn khắc phục lỗi GEMINI API

## 🚨 Lỗi Gemini phổ biến và cách khắc phục

### 1. **"API key Gemini không hợp lệ" (401 Error)**

**Nguyên nhân:**
- API key sai định dạng hoặc đã hết hạn
- API key không được tạo đúng cách

**Khắc phục:**
1. Đảm bảo API key bắt đầu bằng `AIza`
2. Lấy API key mới tại: https://aistudio.google.com/apikey
3. Kiểm tra API key có độ dài ~39 ký tự
4. Thêm vào `.env.local`:
   ```
   GEMINI_API_KEY=AIza-your_actual_api_key_here
   ```

### 2. **"API key bị từ chối" (403 Error)**

**Nguyên nhân:**
- Tài khoản chưa enable Gemini API
- Region không được hỗ trợ
- Quota bị hạn chế

**Khắc phục:**
1. Vào https://aistudio.google.com/apikey
2. Kiểm tra API key có enable Gemini Pro không
3. Kiểm tra quota limits trong dashboard
4. Đổi region nếu cần thiết
5. Enable Gemini API trong Google Cloud Console

### 3. **"Yêu cầu không hợp lệ" (400 Error)**

**Nguyên nhân:**
- Request body không đúng format
- Prompt quá dài hoặc chứa ký tự đặc biệt

**Khắc phục:**
1. Kiểm tra Console để xem request body
2. Đảm bảo prompt không quá 30,000 ký tự
3. Loại bỏ ký tự đặc biệt trong prompt
4. Thử rút ngắn yêu cầu

### 4. **"Quá nhiều request" (429 Error)**

**Nguyên nhân:**
- Vượt quota miễn phí (15 requests/minute)
- Gửi request quá nhanh

**Khắc phục:**
1. Đợi 1 phút trước khi thử lại
2. Giảm tần suất sử dụng
3. Upgrade lên paid plan nếu cần

### 5. **"Gemini API trả về cấu trúc dữ liệu không mong đợi"**

**Nguyên nhân:**
- Google thay đổi API response format
- Content bị filter do policy

**Khắc phục:**
1. Kiểm tra Console để xem raw response
2. Thử prompt khác nhẹ nhàng hơn
3. Kiểm tra Gemini safety settings
4. Report bug nếu cần thiết

## ⚙️ Cấu hình chính xác

### Environment Variables (.env.local)
```bash
# API URL chính thức
FLUX_API_URL=https://api.bfl.ml

# API Key (bắt buộc phải có)
FLUX_API_KEY=bfl-your_actual_api_key_here

# Gemini API Configuration
GEMINI_API_KEY=AIza-your_actual_api_key_here

# OpenAI API (tùy chọn)
OPENAI_API_KEY=sk-proj-your_key_here

# Claude API (tùy chọn)  
CLAUDE_API_KEY=sk-ant-your_key_here
```

### Kiểm tra cấu hình
1. API key đúng định dạng: `bfl-xxxxxxxxx` (Flux) hoặc `AIza-xxxxxxxxx` (Gemini)
2. URL API: `https://api.bfl.ml` (Flux)
3. File `.env.local` được tạo và có nội dung đúng

## 🧪 Test API

Để test xem API có hoạt động không:

**Test Flux API:**
```bash
curl -X POST https://api.bfl.ml/v1/flux-pro-1.1 \
  -H "Authorization: Bearer bfl-your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "test prompt",
    "width": 1024,
    "height": 1024
  }'
```

**Test Gemini API:**
```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIza-your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Hello, how are you?"
      }]
    }]
  }'
```

## 📞 Liên hệ Support

Nếu vẫn gặp lỗi sau khi thử các cách trên:
1. Kiểm tra documentation: https://docs.bfl.ml/ (Flux) hoặc https://ai.google.dev/docs (Gemini)
2. Liên hệ support của Black Forest Labs hoặc Google AI
3. Báo cáo bug trên GitHub repository

## 🔍 Debug Log

Để debug chi tiết, kiểm tra Console trong Browser DevTools hoặc server logs để xem:
- Request URL
- Request headers  
- Response status
- Response body
- API key format validation

Logs sẽ hiển thị thông tin chi tiết về lỗi để dễ dàng khắc phục. 