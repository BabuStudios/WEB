import { sv } from "./sv";

export const locales = ["sv"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "sv";

/** Swedish is the source shape. Every locale must provide exactly these keys. */
type Widen<T> = { readonly [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type Dictionary = Widen<typeof sv>;

export const dictionaries = { sv } as const satisfies Record<Locale, Dictionary>;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
