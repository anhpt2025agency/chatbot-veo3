# Hướng dẫn Deploy ChatBot VEO3 lên Vercel

## Bước 1: Chuẩn bị Database
1. Tạo PostgreSQL database trên [Neon](https://neon.tech) hoặc [Supabase](https://supabase.com)
2. Copy connection string (dạng: `postgresql://username:password@host:5432/database`)

## Bước 2: Environment Variables trên Vercel
Thêm các environment variables sau trong Vercel Dashboard:

### Bắt buộc:
```bash
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=/JtBveInb43che/M5oHSVmILd3hcaLkQSsIrj5EWdEg=
DATABASE_URL=postgresql://username:password@host:5432/database
```

### API Keys (tùy chọn, có thể thêm sau):
```bash
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
FLUX_API_KEY=your-flux-api-key
```

### Google OAuth (tùy chọn):
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Bước 3: Deploy trên Vercel
1. Push code lên GitHub
2. Import repository vào Vercel
3. Vercel sẽ tự động detect Next.js và build
4. Nếu gặp lỗi build, check logs và environment variables

## Bước 4: Sau khi Deploy
1. Truy cập URL của app
2. Đăng ký tài khoản đầu tiên
3. Thêm API keys trong profile
4. Test các tính năng

## Troubleshooting
- **Build Error**: Kiểm tra DATABASE_URL có đúng format không
- **Auth Error**: Kiểm tra NEXTAUTH_URL và NEXTAUTH_SECRET
- **API Error**: Kiểm tra API keys có valid không

## Cập nhật Code
Sau khi deploy lần đầu, mọi commit push lên GitHub sẽ tự động trigger deploy mới. 