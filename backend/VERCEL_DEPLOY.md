# Vercel Backend Deploy Rehberi

## ✅ Hazırlık Tamamlandı

Backend Vercel'e deploy edilmeye hazır! Aşağıdaki adımları takip edin.

## 📋 Deploy Adımları

### 1. Vercel CLI ile Deploy (Önerilen)

```bash
# Backend klasörüne git
cd backend

# Vercel CLI'yi yükle (eğer yoksa)
npm i -g vercel

# Vercel'e login ol
vercel login

# Deploy et
vercel

# Production'a deploy et
vercel --prod
```

### 2. GitHub üzerinden Deploy

1. GitHub repo'yu Vercel'e bağla
2. **Root Directory**: `backend` olarak ayarla
3. **Build Command**: Boş bırak
4. **Output Directory**: Boş bırak
5. **Framework Preset**: Other
6. Deploy et

## 🔧 Environment Variables

Vercel Dashboard'da şu environment variables'ları ekle:

### Zorunlu:
- `JWT_SECRET`: Güçlü bir secret key (örn: `your-super-secret-jwt-key-here-12345`)
- `CORS_ORIGINS`: Frontend URL'i (örn: `https://your-frontend.vercel.app,http://localhost:3000`)

### Otomatik (Vercel tarafından eklenir):
- `VERCEL`: `1` (otomatik)

## 📝 Notlar

### ⚠️ Önemli Uyarılar:

1. **Dosya Sistemi**: Vercel'de `/tmp` klasörü geçicidir ve her function invocation'da sıfırlanır. Production için:
   - **Vercel Blob Storage** kullan (ücretli plan gerekir)
   - Veya **MongoDB Atlas** gibi external database kullan (ücretsiz tier mevcut)

2. **Static Files**: Upload edilen dosyalar için:
   - **Vercel Blob Storage** kullan
   - Veya **Cloudinary** gibi external storage kullan

3. **Timeout**: 
   - Free plan: 10 saniye
   - Pro plan: 60 saniye

4. **In-Memory Fallback**: Dosya yazma başarısız olursa, sistem otomatik olarak in-memory moda geçer (veri kaybı olur ama çalışır).

## 🧪 Test

Deploy sonrası test etmek için:

```bash
# API endpoint'ini test et
curl https://your-backend.vercel.app/

# Response:
# {"message":"E-Commerce API","version":"1.0.0","docs":"/docs"}
```

## 🔗 Frontend Bağlantısı

Frontend'de backend URL'ini güncelle:

```javascript
// frontend/.env veya Vercel environment variables
REACT_APP_BACKEND_URL=https://your-backend.vercel.app
```

## 🐛 Sorun Giderme

### Function Crash (500 Error):
1. Vercel Dashboard > Functions > Logs kontrol et
2. Environment variables'ları kontrol et
3. `JWT_SECRET` ve `CORS_ORIGINS` ayarlandığından emin ol

### Dosya Yazma Hatası:
- Normal! Vercel'de dosya yazma sınırlıdır
- In-memory moda geçer, çalışmaya devam eder
- Production için Vercel Blob Storage veya MongoDB kullan

### CORS Hatası:
- `CORS_ORIGINS` environment variable'ını kontrol et
- Frontend URL'ini doğru ekle

## 📚 Daha Fazla Bilgi

- [Vercel Python Runtime](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/python)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

