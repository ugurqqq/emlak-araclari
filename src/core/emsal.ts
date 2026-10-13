export interface HesapGirdi {
  arsaM2: number;
  emsal: number;
  blokSayisi: number;
  n21: number;
  n31: number;
  m2_21: number;
  m2_31: number;
  cikmaOrani: number;
}

export interface HesapSonuc {
  T: number; // toplam emsal alanı
  Zb: number; // blok başı zemin alanı
  Z: number; // tüm blokların zemin alanı
  K: number; // üst katların toplam (çıkmalı) alanı
  k: number; // üst kat sayısı
  U: number; // bir üst katın alanı (tüm bloklar)
  sapma: number; // oran (0.0106 = %1,06)
  toplamKat: number;
  daire21: number;
  daire31: number;
  toplamDaire: number;
  fark: number; // U - Z (kat başı, tüm bloklar)
  farkBlok: number; // blok başı
}

export type HesapHata = { hata: string };

const sonlu = (x: number) => Number.isFinite(x);

export function hesapla(g: HesapGirdi): HesapSonuc | HesapHata {
  const { arsaM2, emsal, blokSayisi: B, n21, n31, m2_21, m2_31, cikmaOrani: r } = g;
  if (![arsaM2, emsal, B, n21, n31, m2_21, m2_31, r].every(sonlu)) return { hata: 'Geçersiz sayı.' };
  if (arsaM2 <= 0) return { hata: 'Arsa alanı 0\'dan büyük olmalı.' };
  if (emsal <= 0) return { hata: 'Emsal 0\'dan büyük olmalı.' };
  if (B < 1 || !Number.isInteger(B)) return { hata: 'Blok sayısı en az 1 olan bir tam sayı olmalı.' };
  if (n21 < 0 || n31 < 0 || !Number.isInteger(n21) || !Number.isInteger(n31))
    return { hata: 'Daire sayıları 0 veya pozitif tam sayı olmalı.' };
  if (n21 + n31 < 1) return { hata: 'Bir katta en az 1 daire olmalı.' };
  if (m2_21 <= 0 || m2_31 <= 0) return { hata: 'Daire alanları 0\'dan büyük olmalı.' };
  if (r <= 0) return { hata: 'Çıkma oranı 0\'dan büyük olmalı.' };

  const T = arsaM2 * emsal;
  const Zb = n21 * m2_21 + n31 * m2_31;
  const Z = B * Zb;
  if (Z >= T) return { hata: 'Zemin kat alanı toplam emsal alanına eşit veya büyük; üst kat kalmıyor.' };
  const K = (T - Z) * r;
  const lo = Math.max(1, Math.floor(K / Z));
  const hi = Math.max(1, Math.ceil(K / Z));
  const k = Math.abs(K / lo - Z) <= Math.abs(K / hi - Z) ? lo : hi;
  const U = K / k;
  const toplamKat = k + 1;
  const daire21 = B * n21 * toplamKat;
  const daire31 = B * n31 * toplamKat;
  return {
    T, Zb, Z, K, k, U, sapma: (U - Z) / Z, toplamKat, daire21, daire31,
    toplamDaire: daire21 + daire31, fark: U - Z, farkBlok: (U - Z) / B,
  };
}

export const hataMi = (s: HesapSonuc | HesapHata): s is HesapHata => 'hata' in s;

export interface OneriFiltre {
  maxKat?: number; // toplam kat üst sınırı (zemin dahil)
  hedefOran21?: number; // hedef 2+1 oranı (%), 2+1 / (2+1 + 3+1) adet
  tolerans?: number; // yüzde puan
  maxDaire?: number; // varsayılan 12
  limit?: number; // varsayılan 10
}

export interface Oneri {
  n21: number;
  n31: number;
  sonuc: HesapSonuc;
}

export function oner(
  temel: Omit<HesapGirdi, 'n21' | 'n31'>,
  f: OneriFiltre = {},
): Oneri[] {
  const maxDaire = f.maxDaire ?? 12;
  const limit = f.limit ?? 10;
  const out: Oneri[] = [];
  for (let a = 0; a <= maxDaire; a++) {
    for (let b = 0; b <= maxDaire; b++) {
      if (a + b < 1) continue;
      if (f.hedefOran21 !== undefined) {
        const oran = (a / (a + b)) * 100;
        if (Math.abs(oran - f.hedefOran21) > (f.tolerans ?? 0)) continue;
      }
      const s = hesapla({ ...temel, n21: a, n31: b });
      if (hataMi(s)) continue;
      if (f.maxKat !== undefined && s.toplamKat > f.maxKat) continue;
      out.push({ n21: a, n31: b, sonuc: s });
    }
  }
  out.sort(
    (x, y) =>
      Math.abs(x.sonuc.sapma) - Math.abs(y.sonuc.sapma) ||
      x.sonuc.toplamKat - y.sonuc.toplamKat ||
      x.n21 + x.n31 - (y.n21 + y.n31),
  );
  return out.slice(0, limit);
}
