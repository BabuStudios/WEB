/**
 * FACTS REGISTRY — the single source of truth for every number, date,
 * certification and claim on the site.
 *
 * Rules
 * - One fact = one entry = one value. Components and dictionaries never
 *   hard-code a fact: copy references it as `{fact:<id>}`, code as `facts.<id>`.
 * - Never edit a value without explicit operator instruction.
 * - A `missing` fact is never rendered as a number. Anything that depends on
 *   it is built without it (e.g. JSON-LD omits `foundingDate`).
 *
 * Confirmed in Phase 2, 2026-10-09. Source: awimex.se / webshop.awimex.se.
 * Removed on client instruction: ICAO, Svenska LCV Föreningen.
 * Deliberately excluded: revenue, employee count (third-party registers only).
 */

export type NumberFact = {
  kind: "number";
  value: number;
  unit: "year" | "years" | "count";
  /** Rendered qualifier: "30+" rather than "30". */
  qualifier?: "plus";
  source: string;
};

export type TextFact = {
  kind: "text";
  value: string;
  source: string;
};

export type MissingFact = {
  kind: "missing";
  unit: NumberFact["unit"];
  note: string;
};

export type Fact = NumberFact | TextFact | MissingFact;

export const facts = {
  years_in_business: {
    kind: "number",
    value: 30,
    unit: "years",
    qualifier: "plus",
    source: 'awimex.se — "I mer än 30 år har vi levererat innovativa lösningar"',
  },
  founded: {
    kind: "missing",
    unit: "year",
    note: "The AB was registered in 2000 but the business predates it. Never derive a year; JSON-LD omits foundingDate until supplied.",
  },
  cert_iso9001: { kind: "text", value: "ISO 9001", source: "awimex.se footer (verify certificate is current)" },
  cert_iso14001: { kind: "text", value: "ISO 14001", source: "awimex.se footer (verify certificate is current)" },
  parent_group: { kind: "text", value: "Relais Group", source: 'awimex.se footer — "A Relais Group Company"' },
  legal_name: { kind: "text", value: "AWIMEX International AB", source: "webshop.awimex.se footer" },
  org_nr: { kind: "text", value: "556595-7825", source: "webshop.awimex.se footer" },
  street: { kind: "text", value: "Fabriksgatan 27", source: "awimex.se" },
  postal_code: { kind: "text", value: "272 36", source: "awimex.se" },
  city: { kind: "text", value: "Simrishamn", source: "awimex.se" },
  phone_main: { kind: "text", value: "0414-160 50", source: "awimex.se" },
  email_info: { kind: "text", value: "info@awimex.se", source: "awimex.se" },
  email_order: { kind: "text", value: "order@awimex.se", source: "awimex.se" },
  hours_mon_thu: { kind: "text", value: "08.00–16.30", source: "awimex.se" },
  hours_fri: { kind: "text", value: "08.00–15.00", source: "awimex.se" },
} as const satisfies Record<string, Fact>;

export type FactId = keyof typeof facts;
