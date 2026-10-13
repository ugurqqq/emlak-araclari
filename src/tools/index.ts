import type { ComponentType } from 'react';
import Emsal from './emsal/Emsal';

export interface Arac {
  id: string;
  ad: string;
  aciklama: string;
  ikon: string;
  component: ComponentType;
}

// Yeni araç = src/tools/<id>/ klasörü + aşağıya bir satır
export const araclar: Arac[] = [
  { id: 'emsal', ad: 'Emsal / Kat Dengeleme', aciklama: 'Zemin kat ile çıkmalı üst katları dengeleyen kat sayısını ve daire dağılımını bul.', ikon: '🏢', component: Emsal },
];
