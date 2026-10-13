import { describe, it, expect } from 'vitest';
import { parseSayi } from './format';
describe('parseSayi', () => {
  it('Türkçe girdiler', () => {
    expect(parseSayi('0,66')).toBe(0.66);
    expect(parseSayi('9.023')).toBe(9023);
    expect(parseSayi('9.023,5')).toBe(9023.5);
    expect(parseSayi('0.66')).toBe(0.66);
    expect(parseSayi('1,7')).toBe(1.7);
    expect(parseSayi('abc')).toBeNaN();
    expect(parseSayi('')).toBeNaN();
  });
});
