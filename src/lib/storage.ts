const P = 'emlak:';
export function oku<T>(anahtar: string, varsayilan: T): T {
  try {
    const v = localStorage.getItem(P + anahtar);
    return v === null ? varsayilan : (JSON.parse(v) as T);
  } catch {
    return varsayilan;
  }
}
export function yaz(anahtar: string, deger: unknown): void {
  try {
    localStorage.setItem(P + anahtar, JSON.stringify(deger));
  } catch {
    /* kota/gizli mod: sessizce geç */
  }
}
export interface Ayarlar { m2_21: number; m2_31: number; cikmaOrani: number }
export const VARSAYILAN_AYAR: Ayarlar = { m2_21: 93, m2_31: 140, cikmaOrani: 1.7 };
export const ayarOku = () => ({ ...VARSAYILAN_AYAR, ...oku<Partial<Ayarlar>>('ayarlar', {}) });
export const ayarYaz = (a: Ayarlar) => yaz('ayarlar', a);
