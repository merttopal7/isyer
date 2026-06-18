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
| Auth | JWT, Google OAuth 2.0 |
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
| `NEXT_PUBLIC_APP_URL` | Uygulamanın tam URL'i (OAuth callback için kritik) | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | — |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | — |
| `NEXT_PUBLIC_PRODUCTION` | Subdomain routing aktif mi | `false` |
| `NEXT_PUBLIC_BASE_DOMAIN` | Ana domain | — |

---

## Google OAuth Kurulumu

Google ile giriş / kayıt özelliği için Google Cloud Console'da bir OAuth 2.0 istemcisi oluşturmanız gerekir.

### 1. Google Cloud Console'da Proje Oluşturma

1. [Google Cloud Console](https://console.cloud.google.com)'a gidin
2. Üst menüden **Proje seç → Yeni Proje** oluşturun
3. Proje adını girin ve **Oluştur**'a tıklayın

### 2. OAuth Onay Ekranı Yapılandırma

1. Sol menüden **APIs & Services → OAuth consent screen** seçin
2. User Type olarak **External** seçin → **Oluştur**
3. Zorunlu alanları doldurun:
   - **App name**: Uygulamanızın adı (kullanıcıya gösterilir)
   - **User support email**: Destek e-postanız
   - **Developer contact email**: Geliştirici e-postanız
4. **Scopes** adımında şunları ekleyin:
   - `openid`
   - `email`
   - `profile`
5. Kaydedin

### 3. OAuth 2.0 İstemcisi Oluşturma

1. **APIs & Services → Credentials** sayfasına gidin
2. **+ Create Credentials → OAuth 2.0 Client ID** seçin
3. Application type olarak **Web application** seçin
4. **Authorized redirect URIs** bölümüne şunları ekleyin:

**Geliştirme ortamı:**
```
http://localhost:3000/api/auth/google/callback
```

**Production (subdomain routing kapalıysa):**
```
https://www.alanadi.com/api/auth/google/callback
```

**Production (subdomain routing açıksa):**
```
https://www.alanadi.com/api/auth/google/callback
https://modern-berber.alanadi.com/api/auth/google/callback
```

> **Not:** Subdomain routing açıkken işletme subdomain'inden giriş yapıldığında OAuth callback `slug.alanadi.com/api/auth/google/callback` adresine gelir. Eğer tüm subdomain'leri tek tek eklemek istemiyorsanız, Google OAuth'u yalnızca ana domain üzerinden çalıştırabilirsiniz (kullanıcıları önce ana domain'e yönlendirin).

5. **Oluştur**'a tıklayın — **Client ID** ve **Client Secret** kopyalayın

### 4. Env Dosyasını Güncelleme

```env
GOOGLE_CLIENT_ID=123456789-abcdefghijk.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://www.alanadi.com
```

> `NEXT_PUBLIC_APP_URL` callback URI'yi belirler. Production'da tam domain adresinizi yazın.

### 5. Test Kullanıcıları (Yayına Almadan Önce)

OAuth onay ekranı "Testing" modundayken yalnızca eklediğiniz test kullanıcıları giriş yapabilir.

1. **OAuth consent screen → Test users** bölümüne gidin
2. Test edecek Google hesaplarını ekleyin

Uygulamayı herkese açmak için **Publishing status → Publish App** yapın (Google incelemesi gerekmeyebilir, scope'lara göre değişir).

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
nano .env.local  # DB_PASSWORD, JWT_SECRET ve Google OAuth değerlerini doldur

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

### Seed (İlk Kurulumda)

```bash
docker compose --env-file .env.local run --rm migrate npx knex --knexfile knexfile.ts seed:run
```

### Servisler

| Servis | Açıklama |
|--------|----------|
| `db` | PostgreSQL 16, kalıcı volume |
| `migrate` | Uygulama başlamadan önce migration'ları çalıştırır |
| `app` | Next.js production sunucu (port 5656) |

---

## Subdomain Routing

`NEXT_PUBLIC_PRODUCTION=true` olduğunda:

- `alanadi.com/isletme/[slug]/[sayfa]` → `[slug].alanadi.com/[sayfa]` (301 yönlendirme)
- `[slug].alanadi.com/[sayfa]` → `/isletme/[slug]/[sayfa]` (transparent rewrite)

Platform genelinde sayfalar (`/kayit`, `/randevu-sorgula`, `/randevularim`) subdomain'lerde rewrite edilmez, direkt servis edilir.

### DNS Ayarları

| Tip | Ad | Değer |
|-----|----|-------|
| `A` | `@` | Sunucu IP |
| `A` | `www` | Sunucu IP |
| `A` | `*` | Sunucu IP |

### Nginx Örnek Yapılandırması

```nginx
# Ana domain
server {
    listen 443 ssl;
    server_name alanadi.com;
    return 301 https://www.alanadi.com$request_uri;
}
server {
    listen 443 ssl;
    server_name www.alanadi.com;
    location / {
        proxy_pass http://localhost:5656;
        proxy_set_header Host              $host;
        proxy_set_header X-Forwarded-Host  $host;
        proxy_set_header X-Forwarded-Proto https;
    }
}

# İşletme subdomainleri
server {
    listen 443 ssl;
    server_name ~^(?<subdomain>[^.]+)\.alanadi\.com$;
    location / {
        proxy_pass http://localhost:5656;
        proxy_set_header Host              $host;
        proxy_set_header X-Forwarded-Host  $host;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

> Wildcard SSL (`*.alanadi.com`) için DNS challenge ile sertifika alınması gerekir.

---

## SQLite → PostgreSQL Geçişi

```env
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
│   │   │   ├── giris/             # Müşteri girişi
│   │   │   └── kayit/             # Müşteri kaydı
│   │   ├── randevu-sorgula/       # Kod ile randevu sorgula
│   │   └── api/                   # API route'ları
│   │       └── auth/google/       # Google OAuth callback
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
| POST | `/api/auth/login` | Admin girişi (JWT cookie) |
| POST | `/api/auth/logout` | Admin çıkışı |
| GET | `/api/auth/google` | Google OAuth başlat |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| POST | `/api/customer/login` | Müşteri girişi |
| POST | `/api/customer/register` | Müşteri kaydı |
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
