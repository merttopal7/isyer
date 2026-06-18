# Berber App — Multivendor Randevu Sistemi

Next.js 16 + TypeScript + shadcn/ui + Knex.js ile geliştirilmiş çok kiracılı randevu/rezervasyon platformu.

## Özellikler

- **Multivendor**: Berber, hastane, restoran ve özel kategoriler için birden fazla işletme
- **Müşteri akışı**: Hizmet → personel → tarih/saat seçimi → randevu kodu ile takip
- **İşletme admin paneli**: Randevu listesi + takvim görünümü, onay/red, müsaitlik, hizmet ve personel yönetimi
- **Platform admin**: Tüm işletmeler, durum yönetimi, işletme admin kullanıcısı oluşturma
- **Dark/Light mod**: `next-themes` ile sistem temasına uyumlu
- **Responsive**: Mobil sidebar Sheet çekmecesi, tablo ve takvim mobil uyumlu
- **DB agnostic**: SQLite (geliştirme) → PostgreSQL (production) geçişi tek env değişkeni

## Hızlı Başlangıç

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Ortam değişkenlerini ayarla
cp .env.example .env.local

# 3. Veritabanını oluştur ve örnek verileri yükle
npm run migrate
npm run seed

# 4. Geliştirme sunucusunu başlat
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışır.

## Varsayılan Hesaplar (seed sonrası)

| Rol | E-posta | Şifre | Yetki |
|-----|---------|-------|-------|
| Platform Admin | admin@platform.com | admin123 | Tüm işletmeler |
| Berber Admin | admin@modern-berber.com | berber123 | Modern Berber |
| Hastane Admin | admin@saglik-poliklinigi.com | hastane123 | Sağlık Polikliniği |
| Restoran Admin | admin@lezzet-kosesi.com | restoran123 | Lezzet Köşesi |

## Veritabanı Komutları

```bash
npm run migrate          # Migration'ları çalıştır
npm run migrate:rollback # Son migration'ı geri al
npm run seed             # Örnek verileri yükle
npm run db:reset         # Sıfırla + yeniden oluştur
```

## SQLite → PostgreSQL Geçişi

1. `.env.local` dosyasını güncelle:

```env
DB_CLIENT=pg
DB_HOST=localhost
DB_PORT=5432
DB_NAME=berber_db
DB_USER=postgres
DB_PASSWORD=your_password
```

2. PostgreSQL veritabanını oluştur:

```sql
CREATE DATABASE berber_db;
```

3. Migration + seed çalıştır:

```bash
npm run migrate
npm run seed
```

> Tüm Knex sorguları her iki veritabanında da çalışacak şekilde yazılmıştır.

## Proje Yapısı

```
berber-app/
├── migrations/               # Knex migration dosyaları (7 tablo)
├── seeds/                    # Örnek veri (3 işletme, 4 kullanıcı, hizmetler)
├── src/
│   ├── app/
│   │   ├── (auth)/admin/login/   # Login sayfası (admin layout dışında)
│   │   ├── admin/                # Admin panel (JWT korumalı)
│   │   │   ├── [businessId]/randevular/
│   │   │   ├── [businessId]/hizmetler/
│   │   │   ├── [businessId]/musaitlik/
│   │   │   └── isletmeler/       # Platform admin
│   │   ├── isletme/[slug]/       # Müşteri randevu akışı
│   │   ├── randevu-sorgula/      # Telefon/kod ile sorgulama
│   │   └── api/                  # API route'ları
│   ├── components/
│   │   ├── admin/                # Sidebar, MobileNav
│   │   ├── booking/              # 4 adımlı randevu akışı
│   │   └── shared/               # Navbar, ThemeToggle, ThemeProvider
│   ├── lib/
│   │   ├── db/                   # Knex singleton
│   │   ├── auth/                 # JWT, bcrypt, cookie
│   │   ├── slots.ts              # Slot üretim motoru
│   │   └── notifications/        # SMS/e-posta soyutlama (mock)
│   └── types/                    # TypeScript tanımları
└── .env.example
```

## API Referansı

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/login` | Giriş (JWT cookie) |
| POST | `/api/auth/logout` | Çıkış |
| GET | `/api/businesses` | İşletme listesi (admin) |
| POST | `/api/businesses` | Yeni işletme (platform admin) |
| GET | `/api/businesses/slug/[slug]` | Public işletme detayı |
| GET | `/api/services?businessId=` | Hizmetler |
| GET | `/api/staff?businessId=` | Personel/kaynaklar |
| GET | `/api/slots?businessId=&serviceId=&date=` | Müsait slotlar |
| POST | `/api/appointments` | Randevu oluştur |
| GET | `/api/appointments?phone=` | Telefon ile sorgula |
| GET | `/api/appointments?code=` | Kod ile sorgula |
| PATCH | `/api/appointments/[id]` | Onayla / Reddet |
| PUT | `/api/working-hours` | Çalışma saatlerini kaydet |
| POST | `/api/closed-dates` | Kapalı gün ekle |
