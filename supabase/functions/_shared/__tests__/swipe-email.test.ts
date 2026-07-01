import {
  buildSwipeLeadHtml,
  buildSwipeLeadSubject,
  buildVerifyHtml,
  buildVerifySubject,
  timingLabel,
  type SwipeLeadRecord,
} from "../swipe-email";

const lead: SwipeLeadRecord = {
  lead_id: "lead-1",
  created_at: "2026-06-30T12:00:00Z",
  confidence: 87,
  business_uid: "biz-uid-1",
  business_name: "Grantlanta Lawn",
  keyword: "landscaping",
  budget: "1000_5000",
  timing: "this_week",
  contact_name: "Carl Higgins",
  contact_email: "carl@example.com",
  contact_phone: "404-437-2480",
};

describe("buildSwipeLeadSubject", () => {
  it("includes business + keyword when both present", () => {
    expect(buildSwipeLeadSubject(lead)).toBe(
      "New Shmoozer lead — Grantlanta Lawn (landscaping)",
    );
  });

  it("falls back to business only, then a generic subject", () => {
    expect(buildSwipeLeadSubject({ ...lead, keyword: null })).toBe(
      "New Shmoozer lead — Grantlanta Lawn",
    );
    expect(
      buildSwipeLeadSubject({ ...lead, business_name: null, keyword: null }),
    ).toBe("New Shmoozer lead");
  });
});

describe("buildSwipeLeadHtml", () => {
  it("renders the confidence as a rounded %, plus contact + budget + timing", () => {
    const html = buildSwipeLeadHtml(lead);
    expect(html).toContain("87% match");
    expect(html).toContain("Grantlanta Lawn");
    expect(html).toContain("landscaping");
    expect(html).toContain("$1,000 – $5,000");
    expect(html).toContain("This week");
    expect(html).toContain("carl@example.com");
  });

  it("omits empty rows and escapes user text", () => {
    const html = buildSwipeLeadHtml({
      ...lead,
      contact_phone: null,
      timing: null,
      business_name: "Bob & <b>Sons</b>",
    });
    expect(html).not.toContain("Phone:");
    expect(html).not.toContain("Timing:");
    expect(html).toContain("Bob &amp; &lt;b&gt;Sons&lt;/b&gt;");
  });

  it("drops the confidence row when confidence is null", () => {
    const html = buildSwipeLeadHtml({ ...lead, confidence: null });
    expect(html).not.toContain("% match");
  });
});

describe("timingLabel", () => {
  it("maps known values and passes through unknown / empty", () => {
    expect(timingLabel("asap")).toBe("As soon as possible");
    expect(timingLabel("flexible")).toBe("Flexible");
    expect(timingLabel(null)).toBe("");
    expect(timingLabel("whenever")).toBe("whenever");
  });
});

describe("verification email", () => {
  it("has a fixed subject and shows the code", () => {
    expect(buildVerifySubject()).toBe("Your Shmoozer verification code");
    expect(buildVerifyHtml("123456")).toContain("123456");
    expect(buildVerifyHtml("123456")).toContain("expires in 15 minutes");
  });
});
