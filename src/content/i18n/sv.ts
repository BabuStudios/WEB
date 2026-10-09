/**
 * Swedish dictionary — the source locale.
 *
 * Copy rules
 * - No numeric literals. Facts are interpolated: `{fact:<id>}` renders the
 *   formatted value ("30+"), `{fact:<id>|plain}` the bare value ("30").
 * - Every other locale must carry exactly these keys (Phase 5 i18n gate).
 * - ⚑ Copy drafted by Babu Studios from the client's own site text; review in
 *   the Phase 5 copy gate.
 */

export const sv = {
  meta: {
    title: "Awimex — Strömförsörjning och belysning för fordon",
    description:
      "Strömförsörjning, belysning, blåljus, elcentraler och kamerasystem för fordon, båtar och industri. Awimex i {fact:city} — en del av {fact:parent_group}.",
    ogAlt: "En LED-ljusramp tänds i mörker och dimma",
  },

  a11y: {
    skipToContent: "Hoppa till innehållet",
    decorativeWorld: "Dekorativ 3D-miljö. Allt innehåll finns som text på sidan.",
    newTab: "öppnas i en ny flik",
    mainNav: "Huvudmeny",
    openMenu: "Öppna meny",
    closeMenu: "Stäng meny",
  },

  intro: {
    loading: "Laddar",
    skip: "Hoppa över intro",
  },

  nav: {
    home: "Start",
    omOss: "Om oss",
    produkter: "Produkter",
    verksamhet: "Verksamhetsområden",
    kontakt: "Kontakt",
  },

  cta: {
    primary: "Bli kund",
  },

  bridge: {
    title: "Bli företagskund hos Awimex",
    body: "Ansökan görs i vårt kundformulär på awimex.se. Fyll i dina uppgifter så återkommer vi till dig inom kort.",
    needsHeading: "Ha följande till hands",
    needs: {
      company: "Företagsnamn och organisationsnummer",
      addresses: "Faktura- och leveransadress",
      contact: "Kontaktperson med e-post och telefon",
    },
    continue: "Fortsätt till ansökan",
    cancel: "Stäng",
    orCall: "Hellre ett samtal? Ring oss på {fact:phone_main}.",
  },

  scenes: {
    hero: {
      eyebrow: "Strömförsörjning och belysning",
      heading: "Ljus och kraft för fordon som inte får stanna.",
      subhead:
        "Strömförsörjning, belysning och blåljus för fordon, båtar och industri — i mer än {fact:years_in_business|plain} år.",
    },

    omOss: {
      eyebrow: "Om Awimex",
      heading: "Vi säljer inte bara produkter.",
      lead: "Vårt fokus har alltid varit kvalitet, kunnande och service — som tillsammans ger lösningar som fungerar för dig som kund. Vi representerar ett stort antal tillverkare världen över och levererar från {fact:city}.",
      pillars: {
        kvalitet: {
          title: "Kvalitet",
          body: "Vi arbetar noggrant för att välja produkter och lösningar som faktiskt fungerar. Nu och över tid.",
        },
        kunnande: {
          title: "Kunnande",
          body: "I mer än {fact:years_in_business|plain} år har vi levererat lösningar inom strömförsörjning och belysning. Kunskap och engagerade medarbetare är vår nyckel.",
        },
        service: {
          title: "Service",
          body: "Vår framgång bygger på att dina lösningar fungerar. Därför hjälper vi dig hela vägen — och vår support finns tillgänglig.",
        },
      },
      proof: {
        yearsLabel: "år i branschen",
        certifiedLabel: "Certifierade enligt",
        groupLabel: "En del av",
      },
    },

    produkter: {
      eyebrow: "Sortiment",
      heading: "Allt som lyser, laddar och styr.",
      lead: "Fem produktområden, ett stort antal tillverkare — och kunskapen att sätta ihop dem till lösningar som fungerar.",
      families: {
        belysning: {
          title: "Belysning",
          body: "Arbetsljus, extraljus, bakljus, positions- och sidomarkeringsljus och innerbelysning. LED-lösningar som håller, skift efter skift.",
        },
        blaljus: {
          title: "Blåljus",
          body: "Varningsljusramper, beacons, riktat blixtljus, sirener och PA-system — med styrsystem som binder ihop allt.",
        },
        stromforsorjning: {
          title: "Strömförsörjning",
          body: "Omformare, DC-DC-omvandlare, laddpaket, batterier och laddare för fordon, båtar och industri.",
        },
        elcentraler: {
          title: "Elcentraler och styrsystem",
          body: "Elcentraler och styrsystem som fördelar, skyddar och övervakar strömmen i fordonet.",
        },
        kamerasystem: {
          title: "Kamerasystem",
          body: "Backkamerapaket, kameror och skärmar — och integration mot fordonets originalskärm.",
        },
      },
      more: "…och mycket mer: installationsmaterial, solenergi, akustik, takräcken och lastbilstillbehör.",
    },

    verksamhet: {
      eyebrow: "Verksamhetsområden",
      heading: "Där arbetet inte kan vänta.",
      lead: "Fem miljöer med olika krav — och produkter som är framtagna för just dem.",
      areas: {
        utryckning: {
          title: "Utryckning och blåljus",
          body: "Varningsljusramper, riktat blixtljus, sirener och styrsystem för utryckningsfordon. Brett sortiment, gedigen kunskap och support som ökar tillförlitligheten när det gäller.",
        },
        flygplats: {
          title: "Flygplats",
          body: "Produkter framtagna för fordon som opererar på flygplatser — varningsljus med anpassad ljusintensitet och spridningsvinkel, och arbetsljus med ytbehandling som står emot aggressiv antifrysvätska.",
        },
        mil: {
          title: "Militära applikationer",
          body: "Robusta och tåliga MIL-godkända produkter av hög kvalitet för hårda miljöer. Kontakta oss så gör vi rätt från början.",
        },
        husvagn: {
          title: "Husvagn och husbil",
          body: "Solpaneler, litiumbatterier, laddsystem och omformare — energi för friheten att stanna där du vill. Och väghållningsprodukter för en bekväm och säker resa.",
        },
        tunga: {
          title: "Tunga fordon 24V",
          body: "Varningsljus, extraljus, arbetsljus och strömförsörjning för 24V-system och långa skift. Vårt ljus på ditt arbete.",
        },
      },
    },

    kontakt: {
      eyebrow: "Kontakt",
      heading: "Låt oss göra rätt från början.",
      lead: "Ansök om ett företagskonto, eller hör av dig direkt till någon av oss. Du hittar oss på {fact:street} i {fact:city}.",
      labels: {
        address: "Besöksadress",
        phone: "Växel",
        email: "E-post",
        orderEmail: "Order",
        hours: "Öppettider",
        monThu: "Måndag–torsdag",
        fri: "Fredag",
      },
      groups: {
        ledning: "Ledning och administration",
        saljare: "Våra säljare",
        lager: "Lager och verkstad",
        support: "Support",
      },
      callPerson: "Ring {name}",
    },
  },

  inScene: {
    omOss: "KVALITET",
    produkter: "SORTIMENT",
    verksamhet: "PÅ VÄGEN",
  },

  roles: {
    vd: "VD",
    kvalitet_hallbarhet: "Kvalité- och hållbarhetskoordinator",
    kontorschef: "Kontorschef",
    marknadsassistent: "Marknadsassistent",
    ordermottagare: "Ordermottagare",
    administration: "Administration",
    inkop: "Inköp",
    produktkoordinator: "Produktkoordinator",
    forsaljningschef: "Försäljningschef",
    saljare_kam: "Säljare / KAM",
    saljare: "Säljare",
    saljledare_24v: "Säljledare 24V",
    teknisk_innesaljare_blaljus: "Teknisk innesäljare / Blåljus",
    saljare_24v: "Säljare 24V",
    teknisk_saljare_specialprojekt: "Teknisk säljare / Specialprojekt",
    lagerchef: "Lagerchef",
    lager: "Lager",
    lager_kabelverkstad: "Lager / Kabelverkstad",
    kabelverkstad: "Kabelverkstad",
    teknisk_support_teamledare: "Teknisk support / Teamledare",
    teknisk_support_reklamationer: "Teknisk support / Reklamationer",
  },

  footer: {
    legal: "{fact:legal_name} · Org.nr {fact:org_nr}",
    group: "En del av {fact:parent_group}",
  },
} as const;
