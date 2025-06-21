# 🚀 ChatBot VEO3 - Hướng dẫn Setup

## 📋 **Tổng quan**
ChatBot VEO3 là ứng dụng AI Script Writer với hệ thống user management, hỗ trợ tạo kịch bản video và prompt VEO3.

## 🛠️ **Yêu cầu hệ thống**
- **Node.js**: 18.0+ 
- **npm**: 9.0+
- **RAM**: 4GB+
- **Disk**: 2GB trống

## ⚡ **Cài đặt nhanh (5 phút)**

### 1. **Clone repository**
```bash
git clone <repository-url>
cd ChatBot-VEO3
```

### 2. **Cài đặt dependencies**
```bash
npm install
```

### 3. **Cấu hình environment**
```bash
cp env.example .env.local
```

**Chỉnh sửa `.env.local`:**
```bash
# Bắt buộc
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here
DATABASE_URL="file:./dev.db"

# Tùy chọn - Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. **Khởi tạo database**
```bash
npx prisma generate
npx prisma db push
```

### 5. **Chạy ứng dụng**
```bash
npm run dev
```

🎉 **Truy cập:** http://localhost:3000

---

## 🔑 **Cấu hình API Keys**

Sau khi đăng ký/đăng nhập, vào **"Quản lý API Keys"** để cấu hình:

### **Google Gemini** (Khuyến nghị)
1. Vào: https://aistudio.google.com/app/apikey
2. Tạo API key (bắt đầu với `AIza`)
3. Paste vào ứng dụng

### **OpenAI GPT**
1. Vào: https://platform.openai.com/api-keys
2. Tạo API key (bắt đầu với `sk-proj`)
3. Paste vào ứng dụng

### **Anthropic Claude**
1. Vào: https://console.anthropic.com/
2. Tạo API key (bắt đầu với `sk-ant`)
3. Paste vào ứng dụng

### **Flux (Black Forest Labs)**
1. Vào: https://api.bfl.ml/
2. Tạo API key (bắt đầu với `bfl-`)
3. Paste vào ứng dụng

---

## 📚 **Tính năng chính**

### 🤖 **AI Script Writer**
- Tạo kịch bản video ngắn chuyên nghiệp
- Hỗ trợ nhiều phong cách: Hài hước, Giáo dục, Review, v.v.
- Multi-AI support (Gemini, OpenAI, Claude)

### 🎬 **VEO3 Prompt Generator**  
- Tạo prompt cho video VEO3
- Quản lý nhân vật, cảnh quay
- Export prompt chất lượng cao

### 👥 **User Management**
- Đăng ký/Đăng nhập an toàn
- API keys riêng cho từng user
- Lịch sử chat cá nhân

---

## 🚀 **Deploy Production**

### **Option 1: Vercel (Khuyến nghị)**
1. Fork repository về GitHub của bạn
2. Vào https://vercel.com
3. Import project từ GitHub
4. Cấu hình Environment Variables:
   ```
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-production-secret
   DATABASE_URL=your-production-database-url
   ```
5. Deploy!

### **Option 2: Railway**
1. Vào https://railway.app
2. Deploy from GitHub
3. Cấu hình variables tương tự Vercel

### **Option 3: Docker**
```dockerfile
# Dockerfile có sẵn trong project
docker build -t chatbot-veo3 .
docker run -p 3000:3000 chatbot-veo3
```

---

## 🗄️ **Database Options**

### **Development: SQLite** (Mặc định)
```bash
DATABASE_URL="file:./dev.db"
```

### **Production: PostgreSQL**
```bash
# Railway/Vercel Postgres
DATABASE_URL="postgresql://user:pass@host:port/db"
```

### **Production: MySQL**
```bash  
# PlanetScale/Railway MySQL
DATABASE_URL="mysql://user:pass@host:port/db"
```

---

## 🔒 **Bảo mật**

### **NEXTAUTH_SECRET**
Tạo secret key mạnh:
```bash
openssl rand -base64 32
```

### **Google OAuth Setup**
1. Vào: https://console.developers.google.com/
2. Tạo project mới
3. Enable Google+ API
4. Tạo OAuth 2.0 credentials
5. Thêm redirect URI: `https://your-domain.com/api/auth/callback/google`

---

## 🐛 **Troubleshooting**

### **Port đã được sử dụng**
```bash
# Tìm process đang dùng port 3000
lsof -ti:3000

# Kill process
kill -9 <PID>
```

### **Module not found errors**
```bash
# Clear cache và reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### **Database connection error**
```bash
# Reset database
rm prisma/dev.db
npx prisma db push
```

### **API key errors**
- Kiểm tra format API key đúng chưa
- Verify API key còn hoạt động
- Check credits/quota

---

## 🆘 **Hỗ trợ**

### **Logs Debug**
```bash
# Development logs
npm run dev

# Production logs  
npm run build
npm start
```

### **Database GUI**
```bash
# Xem data trong Prisma Studio
npx prisma studio
```

### **Common Issues**
1. **Authentication not working**: Kiểm tra NEXTAUTH_SECRET
2. **API calls failing**: Verify API keys trong database
3. **Build errors**: Check TypeScript issues
4. **Performance slow**: Consider upgrading server resources

---

## 📖 **Tài liệu API**

### **Endpoints chính:**
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/signin` - Đăng nhập  
- `GET /api/user/api-keys` - Lấy API keys
- `POST /api/user/api-keys` - Lưu API key
- `POST /api/script-writer` - Tạo kịch bản
- `POST /api/flux/veo3` - Tạo video VEO3

---

## 🎯 **Production Checklist**

- [ ] NEXTAUTH_SECRET đã set production value
- [ ] NEXTAUTH_URL đã set domain thật
- [ ] Database đã migrate sang PostgreSQL/MySQL
- [ ] SSL certificate đã enable
- [ ] API rate limiting đã setup
- [ ] Monitoring và logging đã cấu hình
- [ ] Backup strategy đã có
- [ ] Error reporting đã setup (Sentry)

---

## 🔄 **Updates**

Để update ứng dụng:
```bash
git pull origin main
npm install
npx prisma generate
npx prisma db push
npm run build
```

---

## 📞 **Liên hệ**

- **GitHub Issues**: [Report bugs](link-to-issues)
- **Documentation**: [Wiki](link-to-wiki)
- **Community**: [Discord/Telegram](link-to-community)

---

**🎉 Chúc bạn sử dụng ChatBot VEO3 thành công!** 