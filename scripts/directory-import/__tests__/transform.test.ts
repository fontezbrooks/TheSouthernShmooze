import {
  decodeText,
  toBooleanFlag,
  normalizePhone,
  splitLoc,
  extractPhones,
  transformRecord,
  buildBatchPayload,
  type DirectoryRecord,
} from '../transform';

describe('decodeText', () => {
  it('decodes HTML entities and trims', () => {
    expect(decodeText('Don&#8217;t')).toBe('Don’t');
    expect(decodeText('&quot;Honey, it&apos;s DONE!&quot;')).toBe('"Honey, it\'s DONE!"');
    expect(decodeText('  spaced  ')).toBe('spaced');
  });
  it('returns null for empty/non-strings', () => {
    expect(decodeText('')).toBeNull();
    expect(decodeText('   ')).toBeNull();
    expect(decodeText(null)).toBeNull();
    expect(decodeText(42)).toBeNull();
  });
});

describe('toBooleanFlag', () => {
  it('treats 1/true as true, everything else false', () => {
    expect(toBooleanFlag(1)).toBe(true);
    expect(toBooleanFlag(true)).toBe(true);
    expect(toBooleanFlag(0)).toBe(false);
    expect(toBooleanFlag(undefined)).toBe(false);
    expect(toBooleanFlag('1')).toBe(false);
  });
});

describe('normalizePhone', () => {
  it('strips non-digits, keeps digit-only intact', () => {
    expect(normalizePhone('(404) 635-6505')).toBe('4046356505');
    expect(normalizePhone('7702415648')).toBe('7702415648');
  });
});

describe('splitLoc', () => {
  it('returns [lng, lat] for valid Atlanta coords', () => {
    expect(splitLoc([-84.2967457, 33.7088688])).toEqual({
      longitude: -84.2967457,
      latitude: 33.7088688,
    });
  });
  it('nulls out invalid / out-of-range / non-array', () => {
    expect(splitLoc([200, 0])).toEqual({ longitude: null, latitude: null });
    expect(splitLoc([0, 99])).toEqual({ longitude: null, latitude: null });
    expect(splitLoc(null)).toEqual({ longitude: null, latitude: null });
    expect(splitLoc([1])).toEqual({ longitude: null, latitude: null });
  });
});

describe('extractPhones', () => {
  it('maps the phn array into positioned normalized rows', () => {
    expect(extractPhones(['(404) 635-6505', '7702415648'])).toEqual([
      { phone_number: '(404) 635-6505', normalized_phone_number: '4046356505', position: 0 },
      { phone_number: '7702415648', normalized_phone_number: '7702415648', position: 1 },
    ]);
  });
  it('returns [] for non-arrays and skips empty entries', () => {
    expect(extractPhones(undefined)).toEqual([]);
    expect(extractPhones(['', '  '])).toEqual([]);
  });
});

describe('transformRecord', () => {
  const sample: DirectoryRecord = {
    uid: '67abb394a58a47dd5100f925',
    nam: '- Nailed it Roofing &amp; Remodeling',
    cnm: 'Voted Southern Shmooze local fav&#128170;',
    ir5: 3,
    cpn: 1,
    lgo: { s: 'https://cdn.example.com/logo.jpg' },
    loc: [-84.2967457, 33.7088688],
    phn: ['7702415648'],
  };

  it('maps all fields with clean names + decoded text', () => {
    const row = transformRecord(sample);
    expect(row).not.toBeNull();
    expect(row).toMatchObject({
      source_uid: '67abb394a58a47dd5100f925',
      name: '- Nailed it Roofing & Remodeling',
      logo_url: 'https://cdn.example.com/logo.jpg',
      longitude: -84.2967457,
      latitude: 33.7088688,
      recommended_score: 3,
      has_coupon: true,
      has_google_marker: false,
    });
    expect(row?.description).toContain('local fav');
    expect(row?.raw_source_payload).toBe(sample);
  });

  it('returns null when uid is missing', () => {
    expect(transformRecord({ ...sample, uid: undefined })).toBeNull();
  });
  it('returns null when nam is missing/empty', () => {
    expect(transformRecord({ ...sample, nam: undefined })).toBeNull();
    expect(transformRecord({ ...sample, nam: '   ' })).toBeNull();
  });
  it('nulls optional fields when absent', () => {
    const row = transformRecord({ uid: 'x', nam: 'Acme' });
    expect(row).toMatchObject({
      description: null,
      logo_url: null,
      longitude: null,
      latitude: null,
      recommended_score: null,
      has_coupon: false,
      has_google_marker: false,
    });
  });
});

describe('buildBatchPayload', () => {
  const json = {
    typ: 'a',
    _re: 837,
    _st: { _mk: 'SECRET_MAPS_KEY', _rc: 'US', crd: { dtl: '<div>[nam]</div>' } },
    usr: [{ uid: '1', nam: 'A' }, { uid: '2', nam: 'B' }],
  };

  it('strips _mk (and keeps other top-level data)', () => {
    const payload = buildBatchPayload(json);
    const raw = JSON.stringify(payload.raw_top_level_payload);
    expect(raw).not.toContain('SECRET_MAPS_KEY');
    expect(raw).not.toContain('_mk');
    expect(payload.raw_top_level_payload._st).toMatchObject({ _rc: 'US' });
  });

  it('omits usr and counts actual processed records', () => {
    const payload = buildBatchPayload(json);
    expect(payload.source_type).toBe('a');
    expect(payload.source_record_count).toBe(2);
    expect(payload.raw_top_level_payload).not.toHaveProperty('usr');
    // claimed total preserved in raw payload
    expect(payload.raw_top_level_payload._re).toBe(837);
  });
});
