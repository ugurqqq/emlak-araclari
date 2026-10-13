# Emlak Araçları — Yol Haritası & Karar Kaydı

Tek kullanıcılı, iPhone'da çalışan, Türkçe emlak/inşaat hesap araçları.
Her sohbet sonunda bu dosya güncellenir.

## Mimari kararlar (2026-10-13)

| Karar | Seçim | Gerekçe |
|---|---|---|
| Platform | **PWA** (Ana Ekrana Ekle) | Yayın yok, Apple hesabı/ücret yok, anında güncelleme |
| Stack | Vite + React + TypeScript, `vite-plugin-pwa` | Hızlı build, offline service worker |
| Hosting | Cloudflare Pages (ücretsiz), GitHub `main` → otomatik deploy | Global CDN, HTTPS, preview URL'ler |
| Routing | Hash router (`#/emsal`) | Sunucu yapılandırması gerekmez |
| Durum | `localStorage` (ayarlar, kalıcı değerler) | Offline, sunucusuz |
| İş mantığı | `src/core/` saf TS + Vitest | UI'dan bağımsız, test edilebilir, ileride Expo'ya taşınabilir |
| Araç ekleme | `src/tools/<arac>/` + `src/tools/index.ts` kaydı | Yeni araç = yeni klasör + bir satır |
| Gelecek backend | Cloudflare Workers (veya FastAPI) `api/` altında | Model/resim algılama çağrıları sunucuda, anahtarlar telefonda değil |
| Versiyonlama | git + semver, `CHANGELOG.md`, uygulamada sürüm etiketi | |

## Klasör yapısı

```
src/
  core/        saf hesaplama fonksiyonları + *.test.ts
  tools/       her araç bir klasör; index.ts araç kaydı
  lib/         storage, format (tr-TR sayı biçimi) vb.
  App.tsx      ana menü + router
docs/
  ROADMAP.md   bu dosya
  specs/       araç spesifikasyonları
```

## Yol haritası

- [x] v0.1 — Mimari, proje iskeleti
- [x] v0.1 — **Emsal / Kat Dengeleme Hesaplayıcı** ([spec](specs/emsal-hesaplayici.md))
- [ ] v0.1 — Cloudflare Pages deploy, iPhone'a ana ekrana ekleme
- [ ] Sonraki fikirler (istek geldikçe): kredi/kira getiri hesabı, m² birim fiyat,
      kat karşılığı paylaşım oranı, PDF/WhatsApp ile sonuç paylaşma
- [ ] Backend aşaması: Workers API + model çağrıları (fotoğraftan oda/m² tahmini vb.)

## Sohbet kaydı

- **2026-10-13** — PWA'ya karar verildi (Expo/Xcode ücretli/7 gün sorunu). El notundan
  emsal/kat dengeleme formülü çıkarıldı ve spec'e yazıldı.

- **2026-10-13 (2)** — v0.1.0 emsal/kat dengeleme hesaplayıcı yapıldı (PWA, testli). Sıradaki: Cloudflare Pages deploy.
