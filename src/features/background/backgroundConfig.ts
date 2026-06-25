/**
 * Pure config + SkSL source for the generative background overlay. Kept free of any
 * Skia/native import so it is unit-testable in jest (the Skia effect lives in
 * `isometricShader.ts`). Recreates Squarespace's morphing "isometric" background art
 * (see memory: shmooze-moving-background / docs/architecture §6).
 */

/** Convert a `#rrggbb` hex string to a normalized `[r, g, b]` triple (0..1). */
export function hexToRgb01(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return [r, g, b];
}

/** Brand-tuned shader parameters (cream → orange, subtle morph, 0.2 overlay opacity). */
export const BG_CONFIG = {
  colorA: hexToRgb01('#e1ded4'), // cream (lightAccent)
  colorB: hexToRgb01('#f1694f'), // orange (accent)
  noiseScale: 3.2,
  speed: 0.35,
  alpha: 0.22,
} as const;

/**
 * SkSL fragment shader: an isometric-skewed, domain-warped fractal-noise field that
 * morphs over time, lit by the noise gradient, tinted along colorA→colorB, output at
 * `u_alpha` (premultiplied) so it composites softly over the daisy base layer.
 */
export const BACKGROUND_SKSL = `
uniform float  u_time;
uniform float2 u_resolution;
uniform float3 u_colorA;
uniform float3 u_colorB;
uniform float  u_noiseScale;
uniform float  u_speed;
uniform float  u_alpha;

float hash(float2 p) {
  return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453123);
}

float noise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);
  float2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + float2(1.0, 0.0));
  float c = hash(i + float2(0.0, 1.0));
  float d = hash(i + float2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(float2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    v += amp * noise(p);
    p = p * 2.0;
    amp = amp * 0.5;
  }
  return v;
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / u_resolution;
  // Isometric skew of the sampling space.
  float2 iso = float2(uv.x + uv.y * 0.5, uv.y - uv.x * 0.25);
  float2 p = iso * u_noiseScale;
  float t = u_time * u_speed;

  // Domain warp = the "morph".
  float2 warp = float2(fbm(p + t * 0.10), fbm(p + float2(5.2, 1.3) + t * 0.13));
  float n = fbm(p + warp * 1.5 + t * 0.05);

  float light = clamp(n * 1.2, 0.0, 1.0);
  float3 col = mix(u_colorA, u_colorB, smoothstep(0.30, 0.80, n));
  col = col * (0.7 + 0.3 * light);

  // Premultiplied output for soft src-over compositing.
  return half4(half3(col) * u_alpha, u_alpha);
}
`;
