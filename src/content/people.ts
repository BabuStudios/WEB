/**
 * CONTACTS REGISTRY — mirrors the staff pages on awimex.se as of 2026-10-09
 * (ledning-administration, inkop-produkt, saljare, lager-verkstad, support).
 * Inköp & produkt is folded into Ledning & administration, as confirmed in Phase 2.
 *
 * Names and direct numbers are verbatim. Titles are dictionary keys
 * (`roles.*`) so a future locale never falls back to Swedish.
 * Never edit without explicit operator instruction.
 */

import type { Dictionary } from "./i18n";

export type RoleKey = keyof Dictionary["roles"];

export type Person = {
  name: string;
  role: RoleKey;
  /** As published, e.g. "0767-60 07 19". Converted to E.164 for tel: links in lib/format. */
  phone: string;
};

export type ContactGroup = {
  id: "ledning" | "saljare" | "lager" | "support";
  people: readonly Person[];
};

export const contactGroups = [
  {
    id: "ledning",
    people: [
      { name: "Björn Udén", role: "vd", phone: "0767-60 07 19" },
      { name: "Fredrik Söder", role: "kvalitet_hallbarhet", phone: "076-664 53 48" },
      { name: "Cia Eriksson", role: "kontorschef", phone: "0767-60 08 91" },
      { name: "Isabell Nilsson", role: "marknadsassistent", phone: "076-760 01 79" },
      { name: "Maria Nilson", role: "ordermottagare", phone: "0767-60 08 98" },
      { name: "Jessica Robertsson", role: "administration", phone: "0767-60 04 61" },
      { name: "Daniel Lundgren", role: "inkop", phone: "0720-92 19 30" },
      { name: "Stefan Dahl", role: "inkop", phone: "0767-60 08 27" },
      { name: "David Kerwall", role: "produktkoordinator", phone: "076-760 01 01" },
    ],
  },
  {
    id: "saljare",
    people: [
      { name: "Anders Claesson", role: "forsaljningschef", phone: "0767-61 60 53" },
      { name: "Henrik Ingemansson", role: "saljare_kam", phone: "0708-61 60 51" },
      { name: "Mattias Persson", role: "saljare", phone: "0767-60 05 33" },
      { name: "Niklas Salomonsson", role: "saljare", phone: "0791-43 82 10" },
      { name: "Johnny Björk", role: "saljledare_24v", phone: "0708-61 60 25" },
      { name: "Johan Bergström", role: "teknisk_innesaljare_blaljus", phone: "0764-92 15 01" },
      { name: "Adam Johansson", role: "saljare", phone: "0764-92 86 66" },
      { name: "Magnus Hamnert", role: "saljare", phone: "0767-24 77 00" },
      { name: "Magnus Berg", role: "saljare_24v", phone: "0726-48 54 74" },
      { name: "Tobias Hansson Edoff", role: "teknisk_saljare_specialprojekt", phone: "0767-60 06 67" },
      { name: "Michael Stenquist", role: "saljare", phone: "0791-15 34 06" },
      { name: "Fredrik Svensson", role: "saljare", phone: "0702-22 64 23" },
      { name: "Peter Hörnberg", role: "saljare_24v", phone: "0766-64 66 86" },
    ],
  },
  {
    id: "lager",
    people: [
      { name: "Linda Haraldsson", role: "lagerchef", phone: "0767-60 03 80" },
      { name: "Elin Gustavsson", role: "lager", phone: "0767-60 03 21" },
      { name: "Anna Åkesson", role: "lager", phone: "0767-60 07 23" },
      { name: "Jacob Pettersson", role: "lager_kabelverkstad", phone: "0708-61 60 52" },
      { name: "Anton Blohmé", role: "lager_kabelverkstad", phone: "0767-60 02 61" },
      { name: "Amanda Andersson", role: "kabelverkstad", phone: "0767-60 02 64" },
    ],
  },
  {
    id: "support",
    people: [
      { name: "Johan Jönsson", role: "teknisk_support_teamledare", phone: "0767-60 05 28" },
      { name: "David Kerwall", role: "teknisk_support_reklamationer", phone: "0767-60 01 01" },
      { name: "Robin Fransson", role: "teknisk_support_reklamationer", phone: "0767-60 03 62" },
    ],
  },
] as const satisfies readonly ContactGroup[];
