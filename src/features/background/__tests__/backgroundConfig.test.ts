import { hexToRgb01, BG_CONFIG } from '../backgroundConfig';

describe('backgroundConfig', () => {
  it('converts hex to normalized rgb', () => {
    expect(hexToRgb01('#ffffff')).toEqual([1, 1, 1]);
    expect(hexToRgb01('#000000')).toEqual([0, 0, 0]);
    const [r, g, b] = hexToRgb01('#f1694f');
    expect(r).toBeCloseTo(0.945, 2);
    expect(g).toBeCloseTo(0.412, 2);
    expect(b).toBeCloseTo(0.31, 2);
  });

  it('uses the brand cream→orange palette', () => {
    expect(BG_CONFIG.colorA).toEqual(hexToRgb01('#e1ded4'));
    expect(BG_CONFIG.colorB).toEqual(hexToRgb01('#f1694f'));
  });

  it('keeps the overlay subtle (alpha ≤ 0.3)', () => {
    expect(BG_CONFIG.alpha).toBeGreaterThan(0);
    expect(BG_CONFIG.alpha).toBeLessThanOrEqual(0.3);
  });
});
