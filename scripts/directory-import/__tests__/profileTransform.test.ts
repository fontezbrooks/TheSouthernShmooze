import { htmlToText } from "../transform";
import {
  transformProfile,
  ensureHttps,
  sanitizeHtml,
  extractAboutHtml,
  type RawProfile,
} from "../../../supabase/functions/_shared/profile-transform";

/** A representative MW profile (mirrors output/profile.json), including the `_mk` secret. */
const raw: RawProfile = {
  uid: "abc",
  nam: "Grantlanta Lawn",
  ctc: "Grant Wallace",
  web: "grantlantalawn.com",
  adr: {
    ad1: "225 glenwood ave se",
    cit: "Atlanta",
    sta: "GA",
    zip: "30312",
    cot: "Fulton County",
    con: "US",
    loc: [-84.38, 33.74],
  },
  pfu: {
    bbb: "www.bbb.org/us/ga/atlanta/profile/grantlanta-lawn",
    fbk: "www.facebook.com/grantlantalawn",
    igm: "",
    goo: "plus.google.com/abc",
  },
  pfk: [{ lbl: "Google Business Profile", url: "https://maps.app.goo.gl/abc" }],
  cpn: {
    cpt: "Title",
    cpd: "Owner deal &mdash; 10% off",
    cpa: "https://cdn.membershipworks.com/u/abc_cp1.jpg",
  },
  pfz: [{ s: "https://cdn/pf1.jpg", l: "https://cdn/pl1.jpg" }],
  _st: {
    // @ts-expect-error _mk is a secret we expect to be stripped (not in the typed shape)
    _mk: "SECRET_MAPS_KEY",
    dir: [
      {
        lbl: "About",
        box: [
          { htm: "<b>Grantlanta Lawn</b>" },
          {
            htm: "<p>We provide <strong>residential and commercial landscaping</strong>, lawn care &amp; garden design.</p>",
          },
          { dat: "map" },
        ],
      },
      { lbl: "Deals!", box: [{ dat: "cpn" }] },
    ],
  },
};

describe("htmlToText", () => {
  it("strips tags, decodes entities, collapses whitespace", () => {
    expect(htmlToText("<p>a &mdash; b</p>")).toBe("a — b");
    expect(htmlToText("<div>Don&rsquo;t  panic</div>")).toBe("Don’t panic");
  });
  it("drops script/style blocks", () => {
    expect(htmlToText("<p>hi</p><script>alert(1)</script>")).toBe("hi");
  });
  it("returns null for non-strings / empty", () => {
    expect(htmlToText("")).toBeNull();
    expect(htmlToText("   ")).toBeNull();
    expect(htmlToText(null)).toBeNull();
  });
});

describe("ensureHttps", () => {
  it("adds a scheme when missing, keeps existing", () => {
    expect(ensureHttps("facebook.com/x")).toBe("https://facebook.com/x");
    expect(ensureHttps("https://a.com")).toBe("https://a.com");
    expect(ensureHttps("http://a.com")).toBe("http://a.com");
  });
  it("returns null for empty / non-strings", () => {
    expect(ensureHttps("")).toBeNull();
    expect(ensureHttps("  ")).toBeNull();
    expect(ensureHttps(undefined)).toBeNull();
  });
});

describe("sanitizeHtml", () => {
  it("removes script blocks and inline event handlers", () => {
    const out = sanitizeHtml('<p onclick="evil()">hi</p><script>x</script>');
    expect(out).toContain("<p");
    expect(out).toContain("hi");
    expect(out).not.toContain("onclick");
    expect(out).not.toContain("<script");
  });
  it("strips event handlers in every attribute form (quoted and unquoted)", () => {
    expect(sanitizeHtml("<img src=x onerror=alert(1)>")).not.toContain(
      "onerror",
    );
    expect(sanitizeHtml("<a onmouseover='x()'>y</a>")).not.toContain(
      "onmouseover",
    );
    expect(sanitizeHtml('<b ONCLICK="x">z</b>')).not.toMatch(/onclick/i);
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).not.toContain(
      "javascript:",
    );
  });
});

describe("extractAboutHtml", () => {
  it("joins the About section's htm blocks and ignores non-About sections", () => {
    const html = extractAboutHtml(raw)!;
    expect(html).toContain("Grantlanta Lawn");
    expect(html).toContain("residential and commercial landscaping");
    expect(html).not.toContain("Deals");
  });
  it("returns null when there is no About section", () => {
    expect(extractAboutHtml({ uid: "x", _st: { dir: [] } })).toBeNull();
    expect(extractAboutHtml({ uid: "x" })).toBeNull();
  });
});

describe("transformProfile", () => {
  const row = transformProfile("abc", raw)!;

  it("derives about_text (search corpus) with decoded entities and no tags", () => {
    expect(row.about_text).toContain("residential and commercial landscaping");
    expect(row.about_text).toContain("lawn care & garden design");
    expect(row.about_text).not.toContain("<");
  });
  it("keeps sanitized about_html for the detail screen", () => {
    expect(row.about_html).toContain("<strong>");
    expect(row.about_html).not.toContain("<script");
  });
  it("maps the scalar fields", () => {
    expect(row.source_uid).toBe("abc");
    // `web` is stored scheme-normalized so the detail screen's link opens.
    expect(row.website).toBe("https://grantlantalawn.com");
    expect(row.contact_name).toBe("Grant Wallace");
  });
  it("normalizes the address (and drops loc)", () => {
    expect(row.address).toMatchObject({
      line1: "225 glenwood ave se",
      city: "Atlanta",
      state: "GA",
      zip: "30312",
    });
    expect(row.address).not.toHaveProperty("loc");
  });
  it("normalizes socials: https-prefixed pfu handles + labelled pfk links, skips empty", () => {
    expect(row.socials!.fbk).toBe("https://www.facebook.com/grantlantalawn");
    expect(row.socials!.bbb).toMatch(/^https:\/\//);
    expect(row.socials).not.toHaveProperty("igm"); // empty → skipped
    expect(row.socials!.links).toEqual([
      { label: "Google Business Profile", url: "https://maps.app.goo.gl/abc" },
    ]);
  });
  it("maps the deal and gallery", () => {
    expect(row.deal).toMatchObject({
      title: "Title",
      image: "https://cdn.membershipworks.com/u/abc_cp1.jpg",
    });
    expect(row.deal!.text).toContain("10% off");
    expect(row.gallery).toEqual([
      { small: "https://cdn/pf1.jpg", large: "https://cdn/pl1.jpg" },
    ]);
  });
  it("strips the _mk secret from raw_profile", () => {
    expect(JSON.stringify(row.raw_profile)).not.toContain("SECRET_MAPS_KEY");
    expect(JSON.stringify(row.raw_profile)).not.toContain("_mk");
  });

  it("returns null when source_uid is missing", () => {
    expect(transformProfile("", raw)).toBeNull();
  });
  it("nulls about/deal/gallery when those sections are absent", () => {
    const sparse = transformProfile("y", { uid: "y", web: "x.com" });
    expect(sparse).not.toBeNull();
    expect(sparse!.about_text).toBeNull();
    expect(sparse!.about_html).toBeNull();
    expect(sparse!.deal).toBeNull();
    expect(sparse!.gallery).toBeNull();
    expect(sparse!.socials).toBeNull();
  });
});
