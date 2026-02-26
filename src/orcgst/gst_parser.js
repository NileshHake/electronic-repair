// gst_parser.js ✅ FINAL robust (label-to-next-label parsing)

const normalize = (s = "") =>
  String(s)
    .replace(/\r/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();

const clean = (v = "") =>
  String(v || "")
    .replace(/^[:\-–—\s]+/, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

const fixMergedWords = (s = "") =>
  String(s)
    // "BusinessProprietorship" -> "Business Proprietorship"
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    // "ofBusiness" -> "of Business"
    .replace(/\bof(?=[A-Z])/g, "of ")
    .trim();

const DATE_RE = /\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\b/;

const extractGstin = (text) => {
  const m1 = text.match(/registration number\s*[:\-–—]?\s*([0-9A-Z]{15})/i);
  if (m1) return m1[1].toUpperCase();

  const m2 = text.match(/\b(\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z])\b/i);
  return m2 ? m2[1].toUpperCase() : "";
};

// ✅ Cut Annexure A/B completely
const mainOnly = (text) => {
  const t = normalize(text);
  const idx = t.search(/\bannexure\b/i);
  return idx >= 0 ? t.slice(0, idx) : t;
};

const escapeRe = (s = "") => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ✅ Extract value after label UNTIL next label (most robust for tables)
const extractBetween = (text, labelPatterns = [], nextLabelPatterns = []) => {
  const t = normalize(text);

  const labelAlt = labelPatterns.map((p) => (p instanceof RegExp ? p.source : escapeRe(p))).join("|");
  const nextAlt = nextLabelPatterns
    .map((p) => (p instanceof RegExp ? p.source : escapeRe(p)))
    .join("|");

  // allow numbering like "2." "3)" before next label
  const re = new RegExp(
    `(?:${labelAlt})\\s*[:\\-–—]?\\s*([\\s\\S]*?)(?=\\n\\s*(?:\\d+\\s*[\\.)]\\s*)?(?:${nextAlt})\\b|\\n\\s*note\\b|$)`,
    "i"
  );

  const m = t.match(re);
  if (!m) return "";
  return clean(fixMergedWords(m[1]));
};

const parseValidity = (text) => {
  const t = normalize(text);

  // One-line: "Period of Validity From 24/08/2021 To Not Applicable"
  const m = t.match(/period of validity\s*from\s*[:\-–—]?\s*([0-9\/\-.]+)\s*to\s*[:\-–—]?\s*([a-z ]+|[0-9\/\-.]+)/i);
  if (m) return { from: clean(m[1]), to: clean(m[2]) };

  // fallback: find dates near keywords
  const from = t.match(/period of validity\s*from[\s\S]{0,80}?(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i)?.[1] || "";
  const to = t.match(/period of validity\s*to[\s\S]{0,80}?(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|not applicable)/i)?.[1] || "";

  return { from: clean(from), to: clean(to) };
};

const parseIssueDate = (text) => {
  const t = normalize(text);
  const m = t.match(/date of issue(?: of certificate)?[\s\S]{0,120}?(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i);
  return m ? clean(m[1]) : "";
};

// ✅ Authority section ONLY (avoid Annexure-B "Name")
const parseApprovingAuthority = (text) => {
  const t = normalize(text);
  const start = t.search(/particulars of approving authority|approving authority/i);
  if (start === -1) {
    return { authority: "", name: "", designation: "", jurisdictionalOffice: "" };
  }

  const section = t.slice(start, start + 1200); // enough window

  const authority = extractBetween(
    section,
    [/(particulars of approving authority|approving authority)/i],
    [/name/i, /designation/i, /jurisdictional office/i, /date of issue/i, /note/i]
  );

  const name = extractBetween(
    section,
    [/^name\b/i, /\bname\b/i],
    [/designation/i, /jurisdictional office/i, /date of issue/i, /note/i]
  );

  const designation = extractBetween(
    section,
    [/designation/i],
    [/jurisdictional office/i, /date of issue/i, /note/i]
  );

  const jurisdictionalOffice = extractBetween(
    section,
    [/jurisdictional office/i],
    [/date of issue/i, /note/i]
  );

  // small cleanup (sometimes OCR merges "Signature")
  const authClean = clean(String(authority).replace(/^signature\s*/i, ""));

  return {
    authority: authClean || "",
    name: clean(name) || "",
    designation: clean(designation) || "",
    jurisdictionalOffice: clean(jurisdictionalOffice) || "",
  };
};

function parseGstCertificate(rawText = "") {
  const main = mainOnly(rawText);

  const gstin = extractGstin(main);

  // ✅ Define common NEXT labels once
  const NEXT = [
    /registration number/i,
    /gstin/i,
    /legal name/i,
    /trade name/i,
    /constitution/i,
    /type of registration/i,
    /address of principal place/i,
    /principal place of business/i,
    /date of liability/i,
    /period of validity/i,
    /particulars of approving authority/i,
    /approving authority/i,
    /date of issue/i,
    /note/i,
    /annexure/i,
  ];

  const legalName = extractBetween(
    main,
    [/(legal name|registered legal name|name of business)/i],
    NEXT
  );

  const tradeName = extractBetween(
    main,
    [/(trade name|trade name,\s*if any|business trade name)/i],
    NEXT
  );

  const constitution = extractBetween(
    main,
    [/(constitution of business|constitution)/i],
    NEXT
  );

  const typeOfRegistration = extractBetween(
    main,
    [/(type of registration|registration type)/i],
    NEXT
  );

  const principalAddress = extractBetween(
    main,
    [/(address of principal place of business|address of principal place|principal place of business)/i],
    NEXT
  );

  const validity = parseValidity(main);
  const dateOfIssue = parseIssueDate(main);
  const approvingAuthority = parseApprovingAuthority(main);

  return {
    data: {
      gstin: gstin || "",
      legalName: legalName || "",
      tradeName: tradeName || "",
      constitutionOfBusiness: constitution || "",
      principalPlaceOfBusinessAddress: principalAddress || "",
      dateOfLiability: "",
      periodOfValidity: { from: validity.from || "", to: validity.to || "" },
      typeOfRegistration: typeOfRegistration || "",
      approvingAuthority,
      dateOfIssueOfCertificate: dateOfIssue || "",
    },
    rawText: normalize(rawText),
  };
}

module.exports = { parseGstCertificate };