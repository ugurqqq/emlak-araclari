const nf = (min: number, max: number) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: min, maximumFractionDigits: max });
const f0 = nf(0, 0), f2 = nf(2, 2);
export const sayi = (x: number, ondalik = 2) => (ondalik === 0 ? f0 : ondalik === 2 ? f2 : nf(ondalik, ondalik)).format(x);
export const m2 = (x: number) => `${f2.format(x)} m²`;
export const yuzde = (oran: number) => `${oran >= 0 ? '+' : '−'}%${f2.format(Math.abs(oran * 100))}`;

/** Türkçe girdiyi sayıya çevirir: virgül ondalık; "9.023" -> 9023; "0.66" -> 0.66. Geçersizse NaN. */
export function parseSayi(s: string): number {
  let t = s.trim().replace(/\s/g, '');
  if (!t) return NaN;
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
  return /^\d*\.?\d+$|^\d+\.$/.test(t) ? Number(t) : NaN;
}
