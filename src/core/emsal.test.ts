import { describe, it, expect } from 'vitest';
import { hesapla, hataMi, oner, type HesapGirdi } from './emsal';

const temel = { arsaM2: 9023, emsal: 0.66, blokSayisi: 1, m2_21: 93, m2_31: 140, cikmaOrani: 1.7 };
const ok = (g: HesapGirdi) => {
  const s = hesapla(g);
  if (hataMi(s)) throw new Error(s.hata);
  return s;
};

describe('hesapla', () => {
  it('örnek 1: k=6, 84 daire', () => {
    const s = ok({ ...temel, n21: 8, n31: 4 });
    expect(s.T).toBeCloseTo(5955.18, 2);
    expect(s.Z).toBe(1304);
    expect(s.K).toBeCloseTo(7907.006, 3);
    expect(s.k).toBe(6);
    expect(s.U).toBeCloseTo(1317.83, 2);
    expect(s.sapma * 100).toBeCloseTo(1.06, 2);
    expect(s.toplamKat).toBe(7);
    expect(s.daire21).toBe(56);
    expect(s.daire31).toBe(28);
    expect(s.toplamDaire).toBe(84);
  });
  it('örnek 2: k=31', () => {
    // Z=1300 -> 13 adet 100 m² (2+1 alanı 100 verilerek)
    const s = ok({ arsaM2: 41600, emsal: 0.6, blokSayisi: 1, n21: 13, n31: 0, m2_21: 100, m2_31: 140, cikmaOrani: 1.7 });
    expect(s.K).toBeCloseTo(40222, 3);
    expect(s.k).toBe(31);
    expect(s.U).toBeCloseTo(1297.48, 2);
    expect(s.sapma * 100).toBeCloseTo(-0.19, 2);
  });
  it('çok bloklu: blok başı fark', () => {
    const s = ok({ ...temel, blokSayisi: 2, n21: 2, n31: 1 });
    expect(s.Z).toBe(2 * 326);
    expect(s.farkBlok).toBeCloseTo(s.fark / 2);
    expect(s.daire21).toBe(2 * 2 * s.toplamKat);
  });
  it('geçersiz girdiler', () => {
    const g = { ...temel, n21: 8, n31: 4 };
    expect(hataMi(hesapla({ ...g, n21: 100, n31: 100 }))).toBe(true); // Z >= T
    expect(hataMi(hesapla({ ...g, arsaM2: 0 }))).toBe(true);
    expect(hataMi(hesapla({ ...g, emsal: -1 }))).toBe(true);
    expect(hataMi(hesapla({ ...g, blokSayisi: 0 }))).toBe(true);
    expect(hataMi(hesapla({ ...g, n21: 0, n31: 0 }))).toBe(true);
    expect(hataMi(hesapla({ ...g, n21: -1 }))).toBe(true);
    expect(hataMi(hesapla({ ...g, cikmaOrani: 0 }))).toBe(true);
    expect(hataMi(hesapla({ ...g, arsaM2: NaN }))).toBe(true);
  });
});

describe('oner', () => {
  it('en fazla 10, |sapma| artan sırada', () => {
    const r = oner(temel);
    expect(r.length).toBe(10);
    for (let i = 1; i < r.length; i++)
      expect(Math.abs(r[i].sonuc.sapma)).toBeGreaterThanOrEqual(Math.abs(r[i - 1].sonuc.sapma));
    expect(r.every((x) => x.n21 + x.n31 >= 1 && x.n21 <= 12 && x.n31 <= 12)).toBe(true);
  });
  it('max kat filtresi', () => {
    const r = oner(temel, { maxKat: 6 });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((x) => x.sonuc.toplamKat <= 6)).toBe(true);
  });
  it('hedef oran filtresi', () => {
    const r = oner(temel, { hedefOran21: 66, tolerans: 5 });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((x) => Math.abs((x.n21 / (x.n21 + x.n31)) * 100 - 66) <= 5)).toBe(true);
  });
});
