import {
  budgetLabel,
  formatStartDate,
  escapeHtml,
  buildSubject,
  buildLeadEmailHtml,
  type LeadRecord,
} from "../lead-email";

const lead: LeadRecord = {
  id: "abc-123",
  first_name: "Carl",
  last_name: "Higgins",
  email: "carl@example.com",
  phone: "(404) 437-2480",
  address: "620 Glen Iris Dr ne",
  budget: ["lt_1000"],
  project_start_date: "2026-07-01",
  project_details: "Is your refrigerator running?",
  file_path: null,
};

describe("budgetLabel", () => {
  it("maps the enum value to the Figma label", () => {
    expect(budgetLabel(["lt_1000"])).toBe("< $1,000");
    expect(budgetLabel(["1000_5000"])).toBe("$1,000 – $5,000");
    expect(budgetLabel(["gt_5000"])).toBe("> $5,000");
  });
  it("returns empty string when unset", () => {
    expect(budgetLabel(null)).toBe("");
    expect(budgetLabel([])).toBe("");
  });
  it("passes through an unknown value rather than throwing", () => {
    expect(budgetLabel(["weird"])).toBe("weird");
  });
});

describe("formatStartDate", () => {
  it("formats an ISO date as a long date", () => {
    expect(formatStartDate("2026-07-01")).toBe("July 01, 2026");
    expect(formatStartDate("2026-12-25")).toBe("December 25, 2026");
  });
  it("returns empty string for null", () => {
    expect(formatStartDate(null)).toBe("");
  });
});

describe("escapeHtml", () => {
  it("escapes the five HTML-significant characters", () => {
    expect(escapeHtml(`<b>"x" & 'y'</b>`)).toBe(
      "&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;",
    );
  });
});

describe("buildSubject", () => {
  it("includes the lead name", () => {
    expect(buildSubject(lead)).toBe("New Concierge submission — Carl Higgins");
  });
});

describe("buildLeadEmailHtml", () => {
  it("renders all fields and the Squarespace-style header", () => {
    const html = buildLeadEmailHtml(lead, null);
    expect(html).toContain(
      "Sent via form submission from The Southern Shmooze",
    );
    expect(html).toContain("Carl Higgins");
    expect(html).toContain("carl@example.com");
    // "< $1,000" — the leading "<" is HTML-escaped so it can't be read as a tag.
    expect(html).toContain("&lt; $1,000");
    expect(html).toContain("July 01, 2026");
    expect(html).toContain("Is your refrigerator running?");
  });

  it("links the file when a signed URL is provided", () => {
    const html = buildLeadEmailHtml(
      { ...lead, file_path: "abc-123/plan.pdf" },
      "https://signed.example/plan.pdf",
    );
    expect(html).toContain(
      `<a href="https://signed.example/plan.pdf">Download file</a>`,
    );
  });

  it("renders concierge trade/zip/newsletter rows (0019 two-step payload)", () => {
    const conciergeLead: LeadRecord = {
      ...lead,
      address: null,
      budget: [],
      project_start_date: null,
      trade: "Plumbing",
      zip: "30303",
      newsletter_opt_in: true,
    };
    const html = buildLeadEmailHtml(conciergeLead, null);
    expect(html).toContain("<strong>Trade:</strong> Plumbing");
    expect(html).toContain("<strong>Zip:</strong> 30303");
    expect(html).toContain("<strong>Newsletter:</strong> Yes");
  });

  it("renders newsletter No when opted out, empty on legacy payloads", () => {
    const optedOut = buildLeadEmailHtml(
      { ...lead, newsletter_opt_in: false },
      null,
    );
    expect(optedOut).toContain("<strong>Newsletter:</strong> No");
    const legacy = buildLeadEmailHtml(lead, null);
    expect(legacy).toContain("<strong>Newsletter:</strong> </p>");
  });

  it("tolerates null contact fields without throwing (nullable since 0019)", () => {
    const html = buildLeadEmailHtml(
      { ...lead, first_name: null, last_name: null, project_details: null },
      null,
    );
    expect(html).toContain("<strong>Name:</strong> </p>");
    expect(buildSubject({ ...lead, first_name: null, last_name: null })).toBe(
      "New Concierge submission",
    );
  });

  it("leaves the file row empty when there is no file", () => {
    const html = buildLeadEmailHtml(lead, null);
    expect(html).toContain("<strong>File Upload:</strong> </p>");
  });

  it("escapes HTML in user-provided fields", () => {
    const html = buildLeadEmailHtml(
      { ...lead, project_details: "<script>alert(1)</script>" },
      null,
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
