# Emsal / Kat Dengeleme Hesaplayıcı — Spesifikasyon

Kaynak: kullanıcının el notu (2026-10-13). Amaç: zemin (giriş) kat alanı ile
çıkmalı üst kat alanını birbirine en yakın yapan kat sayısını ve zemin kat daire
dağılımını bulmak.

## Girdiler

| Alan | Açıklama | Kalıcı? | Varsayılan |
|---|---|---|---|
| `arsaM2` | Toplam arsa alanı (m²) | hayır | — |
| `emsal` | Emsal (KAKS) | hayır | — |
| `blokSayisi` (B) | Özdeş blok sayısı | hayır | 1 |
| `n21`, `n31` | **Blok başına bir kattaki** 2+1 / 3+1 daire sayısı | hayır | — |
| `m2_21`, `m2_31` | İdeal 2+1 / 3+1 daire alanı (m²) | **evet (localStorage)** | 93 / 140 |
| `cikmaOrani` (r) | Üst katlara uygulanan çarpan | **evet** | 1.7 |

## Formül

```
T  = arsaM2 × emsal                          // toplam emsal alanı
Zb = n21·m2_21 + n31·m2_31                   // blok başı zemin kat alanı
Z  = B × Zb                                  // tüm blokların zemin kat alanı
K  = (T − Z) × r                             // üst katların toplam (çıkmalı) alanı
k  = argmin_{k ≥ 1} |K/k − Z|                // aday: floor(K/Z), ceil(K/Z)  (≥1)
U  = K / k                                   // bir üst katın alanı (tüm bloklar)
sapma = (U − Z) / Z                          // % olarak gösterilir
toplamKat   = k + 1 (zemin dahil)
daire 2+1   = B × n21 × (k+1)
daire 3+1   = B × n31 × (k+1)
fazla/eksik = U − Z  (kat başı, tüm bloklar; blok başı = /B)
```

Geçersiz: `Z ≥ T`, herhangi bir sayı ≤ 0 (n21/n31 için ≥0, toplam ≥1).

## Doğrulama örnekleri (birim testleri bunlarla yazılır)

1. Notun alt kısmı: arsa 9023, emsal 0.66, B=1, 8×2+1 (93), 4×3+1 (140), r=1.7
   → T=5955.18, Z=1304, K=7907.006, **k=6**, U≈1317.83, sapma≈+1.06%,
   7 kat, **56 adet 2+1 + 28 adet 3+1 = 84 daire**.
2. Notun üst kısmı: arsa 41600, emsal 0.60, Z=1300 (13×100, B=1), r=1.7
   → T=24960, K=40222, **k=31** (U≈1297.48, sapma≈−0.19%).

## Modlar

1. **Hesapla:** Kullanıcının girdiği n21/n31 ile yukarıdaki sonuç.
2. **En iyi dağılımı öner:** n21 ∈ [0..maxDaire], n31 ∈ [0..maxDaire]
   (varsayılan maxDaire=12, n21+n31 ≥ 1) taranır; her biri için k ve |sapma|
   hesaplanır. Opsiyonel filtreler: maksimum kat sayısı, hedef 2+1 oranı (%)
   ± tolerans. |sapma|'ya göre artan, ilk 10 sonuç listelenir; satıra
   dokununca değerler forma uygulanır.
