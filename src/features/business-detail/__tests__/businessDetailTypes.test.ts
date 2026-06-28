import type { DirectoryBusinessDetailRow } from "@/lib/database";
import { toDetail } from "../businessDetailTypes";

function detailRow(
  over: Partial<DirectoryBusinessDetailRow>,
): DirectoryBusinessDetailRow {
  return {
    source_uid: "uid",
    name: "Grantlanta Lawn",
    description: "tagline",
    logo_url: null,
    longitude: null,
    latitude: null,
    recommended_score: null,
    has_coupon: false,
    is_certified: true,
    about_text: "We do lawns.",
    about_html: null,
    website: "https://grantlanta.example",
    contact_name: "Sam",
    address: {
      line1: "1 Peachtree St",
      city: "Atlanta",
      state: "GA",
      zip: "30301",
      country: "US",
    },
    socials: {
      fbk: "https://facebook.com/x",
      links: [{ label: "Yelp", url: "https://yelp.com/x" }],
    },
    deal: null,
    gallery: [
      { small: "s1", large: "l1" },
      { small: "s2", large: null },
    ],
    phone_numbers: [
      { phone_number: "678-790-4781", normalized_phone_number: "6787904781" },
    ],
    ...over,
  };
}

describe("toDetail", () => {
  it("maps core fields", () => {
    const d = toDetail(detailRow({}));
    expect(d.name).toBe("Grantlanta Lawn");
    expect(d.isCertified).toBe(true);
    expect(d.aboutText).toBe("We do lawns.");
    expect(d.website).toBe("https://grantlanta.example");
  });

  it("normalizes a scheme-less website so the link can open", () => {
    expect(toDetail(detailRow({ website: "www.example.com" })).website).toBe(
      "https://www.example.com",
    );
    // Already-schemed URLs are left as-is; empty/null stay null.
    expect(toDetail(detailRow({ website: "http://x.com" })).website).toBe(
      "http://x.com",
    );
    expect(toDetail(detailRow({ website: null })).website).toBeNull();
  });

  it("formats the address into one line (ad1, cit, sta, zip)", () => {
    expect(toDetail(detailRow({})).address).toBe(
      "1 Peachtree St, Atlanta, GA, 30301",
    );
    expect(toDetail(detailRow({ address: null })).address).toBeNull();
  });

  it("flattens socials with human labels for known keys + labelled links", () => {
    const d = toDetail(detailRow({}));
    expect(d.socials).toEqual([
      { key: "facebook", url: "https://facebook.com/x" },
      { key: "Yelp", url: "https://yelp.com/x" },
    ]);
  });

  it("maps every known social key to its human label", () => {
    const d = toDetail(
      detailRow({
        socials: { bbb: "u", fbk: "u", goo: "u", igm: "u", ylp: "u" },
      }),
    );
    expect(d.socials.map((s) => s.key)).toEqual([
      "Better Business Bureau",
      "facebook",
      "google business profile",
      "instagram",
      "yelp",
    ]);
  });

  it("falls back to the raw key for unmapped socials", () => {
    const d = toDetail(detailRow({ socials: { unknownkey: "u" } }));
    expect(d.socials).toEqual([{ key: "unknownkey", url: "u" }]);
  });

  it("prefers large gallery URLs and drops empty ones", () => {
    expect(toDetail(detailRow({})).gallery).toEqual(["l1", "s2"]);
  });

  it("maps phones to raw + display", () => {
    expect(toDetail(detailRow({})).phones).toEqual([
      { raw: "6787904781", display: "678-790-4781" },
    ]);
  });
});
