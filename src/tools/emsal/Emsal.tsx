import { useEffect, useMemo, useState } from 'react';
import { hesapla, hataMi, oner } from '../../core/emsal';
import { m2, sayi, yuzde, parseSayi } from '../../lib/format';
import { ayarOku, ayarYaz, oku, yaz } from '../../lib/storage';

interface Form { arsa: string; emsal: string; blok: string; n21: string; n31: string }
const BOS: Form = { arsa: '', emsal: '', blok: '1', n21: '', n31: '' };

function Girdi(p: { ad: string; v: string; set: (s: string) => void; ph?: string }) {
  return (
    <label>{p.ad}
      <input inputMode="decimal" autoComplete="off" value={p.v} placeholder={p.ph} onChange={(e) => p.set(e.target.value)} />
    </label>
  );
}
const sapmaSinif = (s: number) => (Math.abs(s) < 0.02 ? 'yesil' : Math.abs(s) < 0.05 ? 'amber' : 'kirmizi');
const Sat = ({ a, b }: { a: string; b: string }) => <div className="sat"><span>{a}</span><b>{b}</b></div>;

export default function Emsal() {
  const [f, setF] = useState<Form>(() => ({ ...BOS, ...oku<Partial<Form>>('emsal:form', {}) }));
  const [ay, setAy] = useState(ayarOku);
  const [ayS, setAyS] = useState(() => ({ a: String(ay.m2_21).replace('.', ','), b: String(ay.m2_31).replace('.', ','), r: String(ay.cikmaOrani).replace('.', ',') }));
  const [maxKat, setMaxKat] = useState('');
  const [oran, setOran] = useState('');
  const [tol, setTol] = useState('10');
  const [maxDaire, setMaxDaire] = useState('12');

  useEffect(() => yaz('emsal:form', f), [f]);
  const set = (k: keyof Form) => (s: string) => setF((o) => ({ ...o, [k]: s }));

  const ayarGir = (k: 'a' | 'b' | 'r') => (s: string) => {
    const n = { ...ayS, [k]: s };
    setAyS(n);
    const a = parseSayi(n.a), b = parseSayi(n.b), r = parseSayi(n.r);
    if (a > 0 && b > 0 && r > 0) { const y = { m2_21: a, m2_31: b, cikmaOrani: r }; setAy(y); ayarYaz(y); }
  };

  const temel = useMemo(() => ({
    arsaM2: parseSayi(f.arsa), emsal: parseSayi(f.emsal), blokSayisi: parseSayi(f.blok), ...ay,
  }), [f.arsa, f.emsal, f.blok, ay]);
  const dolu = f.arsa.trim() && f.emsal.trim() && f.n21.trim() + f.n31.trim() !== '';
  const n21 = f.n21.trim() ? parseSayi(f.n21) : 0;
  const n31 = f.n31.trim() ? parseSayi(f.n31) : 0;
  const s = useMemo(() => (dolu ? hesapla({ ...temel, n21, n31 }) : null), [temel, n21, n31, dolu]);

  const oneriler = useMemo(() => {
    if (!(temel.arsaM2 > 0 && temel.emsal > 0 && temel.blokSayisi >= 1)) return null;
    const mk = parseSayi(maxKat), o = parseSayi(oran), t = parseSayi(tol), md = parseSayi(maxDaire);
    return oner(temel, {
      maxKat: mk > 0 ? mk : undefined,
      hedefOran21: o >= 0 ? o : undefined,
      tolerans: t >= 0 ? t : 0,
      maxDaire: md >= 1 ? Math.min(40, Math.floor(md)) : 12,
    });
  }, [temel, maxKat, oran, tol, maxDaire]);

  const B = temel.blokSayisi;
  return (
    <>
      <section className="kart">
        <h2>Girdiler</h2>
        <div className="izgara">
          <Girdi ad="Arsa alanı (m²)" v={f.arsa} set={set('arsa')} ph="9.023" />
          <Girdi ad="Emsal (KAKS)" v={f.emsal} set={set('emsal')} ph="0,66" />
          <Girdi ad="Blok sayısı" v={f.blok} set={set('blok')} />
          <span />
          <Girdi ad="Kat başı 2+1 (blok başına)" v={f.n21} set={set('n21')} ph="8" />
          <Girdi ad="Kat başı 3+1 (blok başına)" v={f.n31} set={set('n31')} ph="4" />
        </div>
      </section>

      {s && (hataMi(s) ? (
        <section className="kart"><p className="hata">{s.hata}</p></section>
      ) : (
        <section className="kart">
          <h2>Sonuç</h2>
          <div className={`sapma ${sapmaSinif(s.sapma)}`}>{yuzde(s.sapma)} sapma</div>
          <div className="buyuk">{s.k} üst kat · toplam {s.toplamKat} kat</div>
          <Sat a="Toplam emsal alanı" b={m2(s.T)} />
          <Sat a="Zemin kat alanı" b={m2(s.Z)} />
          <Sat a="Üst kat toplam (çıkmalı)" b={m2(s.K)} />
          <Sat a="Önerilen üst kat sayısı" b={String(s.k)} />
          <Sat a="Üst kat alanı" b={m2(s.U)} />
          <Sat a="Kat başı fazla/eksik" b={`${s.fark >= 0 ? '+' : '−'}${m2(Math.abs(s.fark))}`} />
          <Sat a="2+1 daire adedi" b={sayi(s.daire21, 0)} />
          <Sat a="3+1 daire adedi" b={sayi(s.daire31, 0)} />
          <Sat a="Toplam daire" b={sayi(s.toplamDaire, 0)} />
          {B > 1 && (<>
            <Sat a="Blok başı zemin alanı" b={m2(s.Zb)} />
            <Sat a="Blok başı üst kat alanı" b={m2(s.U / B)} />
            <Sat a="Blok başı fazla/eksik" b={`${s.farkBlok >= 0 ? '+' : '−'}${m2(Math.abs(s.farkBlok))}`} />
          </>)}
        </section>
      ))}

      <details>
        <summary>En iyi dağılımı öner</summary>
        <div className="izgara">
          <Girdi ad="Maks. toplam kat" v={maxKat} set={setMaxKat} ph="boş = sınırsız" />
          <Girdi ad="Maks. daire (türü başına)" v={maxDaire} set={setMaxDaire} />
          <Girdi ad="Hedef 2+1 oranı (%)" v={oran} set={setOran} ph="boş = fark etmez" />
          <Girdi ad="Tolerans (± puan)" v={tol} set={setTol} />
        </div>
        {oneriler === null ? <p className="not">Önce arsa alanı ve emsali girin.</p>
          : oneriler.length === 0 ? <p className="not">Bu filtrelerle sonuç yok.</p>
          : <div className="liste">
            {oneriler.map((o) => (
              <button key={`${o.n21}-${o.n31}`} className={`oneri${o.n21 === n21 && o.n31 === n31 ? ' sec' : ''}`}
                onClick={() => setF((x) => ({ ...x, n21: String(o.n21), n31: String(o.n31) }))}>
                <span><b>{o.n21}×2+1 + {o.n31}×3+1</b><small>{o.sonuc.toplamKat} kat · {sayi(o.sonuc.toplamDaire, 0)} daire</small></span>
                <b className={sapmaSinif(o.sonuc.sapma)}>{yuzde(o.sonuc.sapma)}</b>
              </button>
            ))}
          </div>}
        <p className="not">Satıra dokunursanız değerler forma uygulanır.</p>
      </details>

      <details>
        <summary>Ayarlar</summary>
        <div className="izgara">
          <Girdi ad="İdeal 2+1 alanı (m²)" v={ayS.a} set={ayarGir('a')} />
          <Girdi ad="İdeal 3+1 alanı (m²)" v={ayS.b} set={ayarGir('b')} />
          <Girdi ad="Çıkma oranı" v={ayS.r} set={ayarGir('r')} />
        </div>
        <p className="not">Bu değerler cihazda saklanır.</p>
      </details>

      <details>
        <summary>Nasıl hesaplanıyor?</summary>
        <p className="not">
          T = arsa × emsal (toplam emsal alanı)<br />
          Z = blok × (2+1 adet × 2+1 alanı + 3+1 adet × 3+1 alanı) — zemin kat<br />
          K = (T − Z) × çıkma oranı — üst katların toplam alanı<br />
          Üst kat sayısı k, K/k değerini Z'ye en yakın yapan tam sayıdır (K/Z'nin alt veya üst tam değeri).<br />
          Üst kat alanı U = K / k; sapma = (U − Z) / Z.<br />
          Toplam kat = k + 1; daire sayısı = blok × kat başı daire × toplam kat.<br />
          Sapma: yeşil %2'nin altı, sarı %5'in altı, kırmızı daha fazla.
        </p>
      </details>
    </>
  );
}
