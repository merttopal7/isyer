# Berber App — Multivendor Randevu Sistemi

Next.js 16 + TypeScript + shadcn/ui + Knex.js ile geliştirilmiş çok kiracılı randevu/rezervasyon platformu. Her işletme kendi subdomain'inde bağımsız olarak çalışır.

## Özellikler

- **Multivendor** — Berber, hastane, restoran ve özel kategoriler için birden fazla işletme
- **Subdomain routing** — Her işletme `slug.alanadi.com` adresinde otomatik olarak çalışır
- **Müşteri akışı** — Hizmet → personel → tarih/saat seçimi → randevu kodu ile takip
- **İşletme admin paneli** — Randevu listesi, onay/red, müsaitlik, hizmet ve personel yönetimi
- **Platform admin** — Tüm işletmeler, durum yönetimi, işletme admin kullanıcısı oluşturma
- **SEO yönetimi** — Her işletme için meta başlık, açıklama ve anahtar kelime
- **Duyurular** — İşletme bazlı duyuru yayınlama
- **Konum** — Google Maps embed desteği
- **WhatsApp bildirimi** — Randevu oluşturulduğunda direkt WA linki
- **Müşteri hesapları** — Google OAuth veya e-posta/şifre ile giriş
- **Dark/Light mod** — `next-themes` ile sistem temasına uyumlu
- **DB agnostic** — SQLite (geliştirme) → PostgreSQL (production) tek env değişkeniyle

## Teknoloji

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, shadcn/ui |
| Veritabanı | SQLite (geliştirme) / PostgreSQL (production) |
| ORM | Knex.js |
| Auth | JWT, Google OAuth |
| Deployment | Docker, Docker Compose |

---

## Geliştirme Ortamı

### Gereksinimler

- Node.js 20+
- npm 10+

### Kurulum

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

### Varsayılan Hesaplar (seed sonrası)

| Rol | E-posta | Şifre | Yetki |
|-----|---------|-------|-------|
| Platform Admin | admin@platform.com | admin123 | Tüm işletmeler |
| Berber Admin | admin@modern-berber.com | berber123 | Modern Berber |
| Hastane Admin | admin@saglik-poliklinigi.com | hastane123 | Sağlık Polikliniği |
| Restoran Admin | admin@lezzet-kosesi.com | restoran123 | Lezzet Köşesi |

### Npm Komutları

```bash
npm run dev              # Geliştirme sunucusu
npm run build            # Production build
npm run start            # Production sunucu
npm run migrate          # Migration'ları çalıştır
npm run migrate:rollback # Son migration'ı geri al
npm run seed             # Örnek verileri yükle
npm run db:reset         # Sıfırla + yeniden oluştur (rollback + migrate + seed)
```

---

## Ortam Değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyalayıp doldurun:

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `DB_CLIENT` | `better-sqlite3` veya `pg` | `better-sqlite3` |
| `DB_FILENAME` | SQLite dosya yolu | `./dev.sqlite3` |
| `DB_HOST` | PostgreSQL host | — |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Veritabanı adı | — |
| `DB_USER` | Kullanıcı adı | — |
| `DB_PASSWORD` | Şifre | — |
| `JWT_SECRET` | JWT imzalama anahtarı (min. 32 karakter) | — |
| `JWT_EXPIRES_IN` | Token geçerlilik süresi | `7d` |
| `NEXT_PUBLIC_APP_URL` | Uygulama URL'i | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | — |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | — |
| `NEXT_PUBLIC_PRODUCTION` | Subdomain routing aktif mi | `false` |
| `NEXT_PUBLIC_BASE_DOMAIN` | Ana domain | `alanadi.com` |

---

## Production Deployment (Docker)

### Gereksinimler

- Docker Engine 24+
- Docker Compose v2+
- Linux sunucu (Ubuntu/Debian önerilir)

### Sunucu Hazırlığı

```bash
# Docker kur
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker
```

### Hızlı Başlangıç

```bash
# 1. Projeyi sunucuya al
git clone <repo-url> /opt/berber && cd /opt/berber

# 2. Env dosyasını hazırla
cp .env.example .env.local
nano .env.local  # DB_PASSWORD ve JWT_SECRET'i mutlaka doldur

# 3. Build ve başlat (migration'lar otomatik çalışır)
docker compose --env-file .env.local up -d --build

# 4. Logları izle
docker compose logs -f app
```

### Güncelleme

```bash
git pull
docker compose --env-file .env.local up -d --build
```

### Servisler

| Servis | Açıklama |
|--------|----------|
| `db` | PostgreSQL 16, kalıcı volume |
| `migrate` | Uygulama başlamadan önce migration'ları çalıştırır |
| `app` | Next.js production sunucu (port 3000) |

---

## Subdomain Routing

`NEXT_PUBLIC_PRODUCTION=true` olduğunda:

- `alanadi.com/isletme/[slug]/[sayfa]` → `[slug].alanadi.com/[sayfa]` (301 yönlendirme)
- `[slug].alanadi.com/[sayfa]` → `/isletme/[slug]/[sayfa]` (transparent rewrite)

### DNS Ayarları

| Tip | Ad | Değer |
|-----|----|-------|
| `A` | `@` | Sunucu IP |
| `A` | `www` | Sunucu IP |
| `A` | `*` | Sunucu IP |

### Nginx Yapılandırması

```nginx
server {
    listen 80;
    server_name alanadi.com www.alanadi.com *.alanadi.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
sudo ln -s /etc/nginx/sites-available/berber /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d alanadi.com -d www.alanadi.com
```

> Wildcard SSL (`*.alanadi.com`) için DNS provider'ında Certbot DNS plugin'i gerekir.

---

## SQLite → PostgreSQL Geçişi

```env
# .env.local
DB_CLIENT=pg
DB_HOST=localhost
DB_PORT=5432
DB_NAME=berber_db
DB_USER=postgres
DB_PASSWORD=your_password
```

```sql
CREATE DATABASE berber_db;
```

```bash
npm run migrate
npm run seed
```

> Tüm Knex sorguları her iki veritabanında da çalışacak şekilde yazılmıştır.

---

## Proje Yapısı

```
berber-app/
├── migrations/                    # Knex migration dosyaları
├── seeds/                         # Örnek veri
├── src/
│   ├── app/
│   │   ├── (auth)/admin/login/    # Platform admin girişi
│   │   ├── admin/[businessId]/    # İşletme admin paneli
│   │   │   ├── randevular/        # Randevu yönetimi + takvim
│   │   │   ├── hizmetler/         # Hizmet yönetimi
│   │   │   ├── personel/          # Personel yönetimi
│   │   │   ├── musaitlik/         # Çalışma saatleri + kapalı günler
│   │   │   ├── duyurular/         # Duyuru yönetimi
│   │   │   └── ayarlar/           # Genel, İletişim, Konum, SEO
│   │   ├── admin/isletmeler/      # Platform admin — işletme listesi
│   │   ├── isletme/[slug]/        # Müşteri arayüzü
│   │   │   ├── duyurular/         # Duyurular
│   │   │   ├── randevu/           # Randevu al
│   │   │   ├── randevularim/      # Randevularım
│   │   │   ├── konum/             # Konum
│   │   │   └── giris/             # Müşteri girişi
│   │   ├── randevu-sorgula/       # Kod ile randevu sorgula
│   │   └── api/                   # API route'ları
│   ├── components/
│   │   ├── admin/                 # Sidebar, MobileNav
│   │   ├── isletme/               # BusinessNavbar, BusinessHeader
│   │   └── shared/                # ThemeToggle, ThemeProvider
│   ├── lib/
│   │   ├── db/                    # Knex singleton
│   │   ├── auth/                  # JWT, bcrypt, cookie
│   │   ├── customer-auth/         # Müşteri oturum yönetimi
│   │   ├── url.ts                 # bizPath / bizUrl yardımcıları
│   │   └── slots.ts               # Randevu slot hesaplama
│   └── types/                     # TypeScript tip tanımları
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## API Referansı

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/login` | Giriş (JWT cookie) |
| POST | `/api/auth/logout` | Çıkış |
| GET | `/api/businesses` | İşletme listesi (admin) |
| POST | `/api/businesses` | Yeni işletme (platform admin) |
| PATCH | `/api/businesses/[id]` | İşletme güncelle |
| GET | `/api/businesses/slug/[slug]` | Public işletme detayı |
| GET | `/api/services?businessId=` | Hizmetler |
| GET | `/api/staff?businessId=` | Personel/kaynaklar |
| GET | `/api/slots?businessId=&serviceId=&date=` | Müsait slotlar |
| POST | `/api/appointments` | Randevu oluştur |
| GET | `/api/appointments?phone=` | Telefon ile sorgula |
| GET | `/api/appointments?code=` | Kod ile sorgula |
| PATCH | `/api/appointments/[id]` | Onayla / Reddet / İptal |
| PUT | `/api/working-hours` | Çalışma saatlerini kaydet |
| POST | `/api/closed-dates` | Kapalı gün ekle |
| GET | `/api/announcements?businessId=` | Duyurular |
| POST | `/api/announcements` | Duyuru oluştur |
