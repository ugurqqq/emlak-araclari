// Basit PNG üretici (bağımlılıksız): teal zemin + beyaz ev silüeti
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = ~0; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return ~c >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
function png(s) {
  const raw = Buffer.alloc((s * 4 + 1) * s);
  for (let y = 0; y < s; y++) {
    raw[y * (s * 4 + 1)] = 0;
    for (let x = 0; x < s; x++) {
      const u = x / s, v = y / s;
      const roof = v > 0.22 && v < 0.5 && Math.abs(u - 0.5) < (v - 0.22) * 1.3;
      const body = v >= 0.5 && v < 0.78 && u > 0.26 && u < 0.74;
      const door = v > 0.6 && v < 0.78 && u > 0.45 && u < 0.55;
      const white = (roof || body) && !door;
      const o = y * (s * 4 + 1) + 1 + x * 4;
      const [r, g, b] = white ? [255, 255, 255] : [15, 118, 110];
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = 255;
    }
  }
  const ih = Buffer.alloc(13); ih.writeUInt32BE(s, 0); ih.writeUInt32BE(s, 4); ih[8] = 8; ih[9] = 6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', ih), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
for (const [n, s] of [['icon-192.png',192],['icon-512.png',512],['apple-touch-icon.png',180]]) writeFileSync('public/' + n, png(s));
