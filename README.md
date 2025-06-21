# 🤖 ChatBot VEO3 - AI Script Writer & VEO3 Prompt Generator

[![Next.js](https://img.shields.io/badge/Next.js-14.2.30-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com/)

**Ứng dụng AI tạo kịch bản video chuyên nghiệp với hệ thống multi-user, hỗ trợ Gemini, OpenAI, Claude và VEO3.**

⚠️ **QUAN TRỌNG**: Chỉ sử dụng API thật - KHÔNG có template hay demo mode.

## ✨ **Tính năng nổi bật**

### 🎬 **AI Script Writer**
- **Multi-AI Support**: Google Gemini, OpenAI GPT, Anthropic Claude
- **Smart Prompting**: Phân tích yêu cầu trước khi tạo kịch bản
- **Content Styles**: Bác sĩ, Review, Hài hước, Phỏng vấn, Giáo dục, v.v.
- **Quality Control**: Validation và cải thiện tự động
- **Real-time Chat**: Giao diện chat tương tác

### 🚀 **VEO3 Prompt Generator**
- **Character Management**: Tạo và quản lý nhân vật
- **Scene Builder**: Thiết kế cảnh quay chuyên nghiệp
- **Flux Integration**: Tích hợp Black Forest Labs API
- **Export Quality**: Xuất prompt chất lượng cao

### 👥 **Multi-User System**
- **Secure Authentication**: NextAuth.js với JWT + Database
- **Personal API Keys**: Mỗi user quản lý API keys riêng trong database
- **Session Management**: Database-backed sessions
- **Google OAuth**: Đăng nhập nhanh với Google
- **User Isolation**: Dữ liệu hoàn toàn tách biệt

### 🔒 **Bảo mật & Performance**
- **API Key Encryption**: Lưu trữ an toàn trong database
- **Rate Limiting**: Bảo vệ API endpoints
- **Input Validation**: Kiểm tra dữ liệu server-side
- **Optimized Build**: 113KB First Load JS
- **Production Ready**: Docker + Standalone output

## 🚀 **Cài đặt nhanh (2 phút)**

### **Option 1: Docker (Khuyến nghị)**
```bash
# Clone repository
git clone https://github.com/your-username/chatbot-veo3.git
cd chatbot-veo3

# Deploy với Docker (tự động tạo .env.local)
./deploy-quick.sh development

# ✅ Truy cập: http://localhost:3000
```

### **Option 2: Manual Setup**
```bash
# Install dependencies
npm install

# Setup environment
cp env.example .env.local
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.local

# Initialize database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

## 🔑 **Cấu hình API Keys**

**Bước 1**: Đăng ký tài khoản tại `/auth/signup`

**Bước 2**: Vào "Quản lý API Keys" và thêm ít nhất 1 API key:

### **Google Gemini** (Khuyến nghị - Miễn phí)
```bash
# Lấy key tại: https://aistudio.google.com/app/apikey
# Format: AIza... 
# Hạn mức: 15 requests/phút miễn phí
```

### **OpenAI GPT**
```bash
# Lấy key tại: https://platform.openai.com/api-keys
# Format: sk-proj-...
# Chi phí: ~$0.002/1K tokens
```

### **Anthropic Claude**
```bash
# Lấy key tại: https://console.anthropic.com/
# Format: sk-ant-...
# Chi phí: ~$0.008/1K tokens
```

### **Flux (Black Forest Labs)** - Tùy chọn
```bash
# Lấy key tại: https://api.bfl.ml/
# Format: bfl-...
# Cho VEO3 video generation
```

## 📚 **Hướng dẫn sử dụng**

### **1. Đăng ký và đăng nhập**
- Vào `/auth/signup` tạo tài khoản mới
- Hoặc đăng nhập bằng `/auth/signin`
- Hoặc dùng Google OAuth

### **2. Cấu hình API Keys**
- Click "⚡ Quản lý API Keys" trong header
- Thêm API key với provider tương ứng
- Keys được lưu mã hóa trong database

### **3. Tạo kịch bản AI**
- Chọn style (Bác sĩ, Review, Hài hước, v.v.)
- Mô tả video muốn tạo
- AI phân tích và tạo kịch bản chuyên nghiệp
- Tinh chỉnh với follow-up messages

### **4. Tạo VEO3 Video** (Tùy chọn)
- Dùng kịch bản AI làm prompt
- Cấu hình tham số video
- Generate qua Flux API

## 🌐 **Deploy Production**

### **Vercel (1-click)**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/chatbot-veo3)

```bash
# Environment Variables:
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL=postgresql://...
```

### **Railway**
```bash
# 1. Connect GitHub repo
# 2. Add environment variables
# 3. Add PostgreSQL add-on
# 4. Deploy automatically
```

### **Docker Production**
```bash
# Deploy với PostgreSQL
./deploy-quick.sh production

# Hoặc custom
docker-compose --profile production up -d
```

### **VPS/Server**
```bash
# Build và chạy
npm run build
npm start

# Hoặc với PM2
pm2 start npm --name "chatbot-veo3" -- start
```

## 🛠️ **Tech Stack**

**Frontend:**
- Next.js 14.2.30 + React 18
- TypeScript + Tailwind CSS
- Custom UI components

**Backend:**
- Next.js API Routes
- NextAuth.js (JWT + Database)
- Prisma ORM

**Database:**
- SQLite (Development)
- PostgreSQL/MySQL (Production)

**AI Integration:**
- Google Gemini API
- OpenAI GPT API
- Anthropic Claude API
- Black Forest Labs Flux API

**Deployment:**
- Docker + Docker Compose
- Vercel + Railway support
- Standalone output

## 📊 **Performance Metrics**

```bash
Route (app)                              Size     First Load JS
┌ ○ /                                    16.5 kB         113 kB
├ ○ /auth/signin                         2.04 kB         109 kB
├ ○ /auth/signup                         2.45 kB         109 kB
└ ƒ /api/* (Dynamic APIs)                0 B                0 B

✅ Build: Successfully optimized
✅ Static Pages: 10/10 pre-rendered  
✅ Bundle: Tree-shaking enabled
✅ Lighthouse: 95+ Performance Score
```

## 🔧 **Development**

### **Commands**
```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint check
npx prisma studio # Database GUI
```

### **Database Management**
```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Reset database
npx prisma db push --force-reset

# View data
npx prisma studio
```

### **Testing APIs**
```bash
# Test authentication
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'

# Test script writer (needs authentication)
curl -X POST http://localhost:3000/api/script-writer \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"userMessage": "Tạo video về cà phê", "prompt": "general"}'
```

## 🆘 **Troubleshooting**

### **Common Issues**

**❌ "Cannot find module './276.js'"**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**❌ "API key not valid"**
```bash
# Check API key format:
# Gemini: AIza...
# OpenAI: sk-proj-...
# Claude: sk-ant-...
# Verify key still active and has credits
```

**❌ "Database connection error"**
```bash
# Reset database
rm prisma/dev.db
npx prisma db push
```

**❌ "Authentication not working"**
```bash
# Check NEXTAUTH_SECRET is set
openssl rand -base64 32
# Add to .env.local
```

### **Debug Mode**
```bash
# Enable debug logging
DEBUG=* npm run dev

# Database logs
npx prisma studio

# Check API responses
# Enable debug in app/api/script-writer/route.ts
```

## 🤝 **Đóng góp**

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Tạo Pull Request

## 📖 **Tài liệu chi tiết**

- **Setup Guide**: [SETUP.md](./SETUP.md) - Hướng dẫn setup chi tiết
- **Production Guide**: [env.production](./env.production) - Cấu hình production
- **API Troubleshooting**: [FLUX-API-TROUBLESHOOTING.md](./FLUX-API-TROUBLESHOOTING.md)

## 📄 **License**

MIT License - xem [LICENSE](./LICENSE) để biết chi tiết.

## 🎯 **Roadmap**

- [ ] **Chat History**: Lưu lịch sử chat per user
- [ ] **Content Templates**: Template kịch bản có sẵn
- [ ] **Bulk Generation**: Tạo nhiều kịch bản cùng lúc
- [ ] **Export Options**: PDF, Word, Notion export
- [ ] **Team Collaboration**: Share và collaborate kịch bản
- [ ] **Analytics**: Thống kê usage và performance

## ⭐ **Support**

Nếu project hữu ích, hãy cho 1 ⭐ để support nhé!

**Issues**: [GitHub Issues](https://github.com/your-username/chatbot-veo3/issues)
**Discussions**: [GitHub Discussions](https://github.com/your-username/chatbot-veo3/discussions)

---

**🚀 Made with ❤️ for Vietnamese Content Creators**

**🎯 Professional AI-powered script generation for video content creators**