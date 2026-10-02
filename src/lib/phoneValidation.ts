import { Country } from "country-state-city";

export type PhoneDigitRule = {
  min: number;
  max: number;
  isoCode?: string;
  dialCode?: string;
  countryName?: string;
};

const FALLBACK_RULE: Pick<PhoneDigitRule, "min" | "max"> = { min: 6, max: 15 };

// Comprehensive country-specific national number lengths (without country dialing code).
const PHONE_DIGIT_RULES_BY_ISO: Record<string, { min: number; max: number }> = {
  AD: { min: 6, max: 6 },
  AE: { min: 9, max: 9 },
  AF: { min: 9, max: 9 },
  AG: { min: 10, max: 10 },
  AL: { min: 9, max: 9 },
  AM: { min: 8, max: 8 },
  AO: { min: 9, max: 9 },
  AR: { min: 10, max: 10 },
  AT: { min: 10, max: 13 },
  AU: { min: 9, max: 9 },
  AW: { min: 7, max: 7 },
  AZ: { min: 9, max: 9 },
  BA: { min: 8, max: 8 },
  BB: { min: 10, max: 10 },
  BD: { min: 10, max: 10 },
  BE: { min: 9, max: 9 },
  BF: { min: 8, max: 8 },
  BG: { min: 9, max: 9 },
  BH: { min: 8, max: 8 },
  BI: { min: 8, max: 8 },
  BJ: { min: 8, max: 8 },
  BN: { min: 7, max: 7 },
  BO: { min: 8, max: 8 },
  BR: { min: 10, max: 11 },
  BS: { min: 10, max: 10 },
  BT: { min: 8, max: 8 },
  BW: { min: 8, max: 8 },
  BY: { min: 9, max: 9 },
  BZ: { min: 7, max: 7 },
  CA: { min: 10, max: 10 },
  CD: { min: 9, max: 9 },
  CF: { min: 8, max: 8 },
  CG: { min: 9, max: 9 },
  CH: { min: 9, max: 9 },
  CI: { min: 10, max: 10 },
  CL: { min: 9, max: 9 },
  CM: { min: 9, max: 9 },
  CN: { min: 11, max: 11 },
  CO: { min: 10, max: 10 },
  CR: { min: 8, max: 8 },
  CU: { min: 8, max: 8 },
  CV: { min: 7, max: 7 },
  CY: { min: 8, max: 8 },
  CZ: { min: 9, max: 9 },
  DE: { min: 10, max: 11 },
  DJ: { min: 8, max: 8 },
  DK: { min: 8, max: 8 },
  DM: { min: 10, max: 10 },
  DO: { min: 10, max: 10 },
  DZ: { min: 9, max: 9 },
  EC: { min: 9, max: 9 },
  EE: { min: 7, max: 8 },
  EG: { min: 10, max: 10 },
  ES: { min: 9, max: 9 },
  ET: { min: 9, max: 9 },
  FI: { min: 9, max: 10 },
  FJ: { min: 7, max: 7 },
  FR: { min: 9, max: 9 },
  GA: { min: 8, max: 8 },
  GB: { min: 10, max: 10 },
  GD: { min: 10, max: 10 },
  GE: { min: 9, max: 9 },
  GH: { min: 9, max: 9 },
  GM: { min: 7, max: 7 },
  GN: { min: 9, max: 9 },
  GQ: { min: 9, max: 9 },
  GR: { min: 10, max: 10 },
  GT: { min: 8, max: 8 },
  GW: { min: 7, max: 7 },
  GY: { min: 7, max: 7 },
  HK: { min: 8, max: 8 },
  HN: { min: 8, max: 8 },
  HR: { min: 9, max: 9 },
  HT: { min: 8, max: 8 },
  HU: { min: 9, max: 9 },
  ID: { min: 10, max: 12 },
  IE: { min: 9, max: 9 },
  IL: { min: 9, max: 9 },
  IN: { min: 10, max: 10 },
  IQ: { min: 10, max: 10 },
  IR: { min: 10, max: 10 },
  IS: { min: 7, max: 7 },
  IT: { min: 9, max: 10 },
  JM: { min: 10, max: 10 },
  JO: { min: 9, max: 9 },
  JP: { min: 10, max: 10 },
  KE: { min: 9, max: 9 },
  KG: { min: 9, max: 9 },
  KH: { min: 8, max: 9 },
  KM: { min: 7, max: 7 },
  KN: { min: 10, max: 10 },
  KR: { min: 9, max: 10 },
  KW: { min: 8, max: 8 },
  KY: { min: 10, max: 10 },
  KZ: { min: 10, max: 10 },
  LA: { min: 9, max: 10 },
  LB: { min: 8, max: 8 },
  LC: { min: 10, max: 10 },
  LI: { min: 7, max: 7 },
  LK: { min: 9, max: 9 },
  LR: { min: 8, max: 9 },
  LS: { min: 8, max: 8 },
  LT: { min: 8, max: 8 },
  LU: { min: 9, max: 9 },
  LV: { min: 8, max: 8 },
  LY: { min: 9, max: 9 },
  MA: { min: 9, max: 9 },
  MC: { min: 8, max: 8 },
  MD: { min: 8, max: 8 },
  ME: { min: 8, max: 8 },
  MG: { min: 9, max: 9 },
  MK: { min: 8, max: 8 },
  ML: { min: 8, max: 8 },
  MM: { min: 8, max: 10 },
  MN: { min: 8, max: 8 },
  MO: { min: 8, max: 8 },
  MR: { min: 8, max: 8 },
  MT: { min: 8, max: 8 },
  MU: { min: 8, max: 8 },
  MV: { min: 7, max: 7 },
  MW: { min: 9, max: 9 },
  MX: { min: 10, max: 10 },
  MY: { min: 9, max: 10 },
  MZ: { min: 9, max: 9 },
  NA: { min: 9, max: 9 },
  NE: { min: 8, max: 8 },
  NG: { min: 10, max: 10 },
  NI: { min: 8, max: 8 },
  NL: { min: 9, max: 9 },
  NO: { min: 8, max: 8 },
  NP: { min: 10, max: 10 },
  NZ: { min: 8, max: 9 },
  OM: { min: 8, max: 8 },
  PA: { min: 8, max: 8 },
  PE: { min: 9, max: 9 },
  PG: { min: 8, max: 8 },
  PH: { min: 10, max: 10 },
  PK: { min: 10, max: 10 },
  PL: { min: 9, max: 9 },
  PR: { min: 10, max: 10 },
  PS: { min: 9, max: 9 },
  PT: { min: 9, max: 9 },
  PY: { min: 9, max: 9 },
  QA: { min: 8, max: 8 },
  RO: { min: 9, max: 9 },
  RS: { min: 9, max: 9 },
  RU: { min: 10, max: 10 },
  RW: { min: 9, max: 9 },
  SA: { min: 9, max: 9 },
  SB: { min: 7, max: 7 },
  SC: { min: 7, max: 7 },
  SD: { min: 9, max: 9 },
  SE: { min: 9, max: 9 },
  SG: { min: 8, max: 8 },
  SI: { min: 8, max: 8 },
  SK: { min: 9, max: 9 },
  SL: { min: 8, max: 8 },
  SM: { min: 8, max: 9 },
  SN: { min: 9, max: 9 },
  SO: { min: 8, max: 9 },
  SR: { min: 7, max: 7 },
  SS: { min: 9, max: 9 },
  ST: { min: 7, max: 7 },
  SV: { min: 8, max: 8 },
  SY: { min: 9, max: 9 },
  SZ: { min: 8, max: 8 },
  TD: { min: 8, max: 8 },
  TG: { min: 8, max: 8 },
  TH: { min: 9, max: 9 },
  TJ: { min: 9, max: 9 },
  TL: { min: 8, max: 8 },
  TM: { min: 8, max: 8 },
  TN: { min: 8, max: 8 },
  TO: { min: 7, max: 7 },
  TR: { min: 10, max: 10 },
  TT: { min: 10, max: 10 },
  TW: { min: 9, max: 9 },
  TZ: { min: 9, max: 9 },
  UA: { min: 9, max: 9 },
  UG: { min: 9, max: 9 },
  US: { min: 10, max: 10 },
  UY: { min: 8, max: 8 },
  UZ: { min: 9, max: 9 },
  VC: { min: 10, max: 10 },
  VE: { min: 10, max: 10 },
  VN: { min: 9, max: 9 },
  VU: { min: 7, max: 7 },
  WS: { min: 7, max: 7 },
  YE: { min: 9, max: 9 },
  ZA: { min: 9, max: 9 },
  ZM: { min: 9, max: 9 },
  ZW: { min: 9, max: 9 },
};

const ALL_COUNTRIES = Country.getAllCountries();

const COUNTRY_BY_ISO = new Map(
  ALL_COUNTRIES.map((country) => [country.isoCode.toUpperCase(), country] as const)
);

const COUNTRY_BY_NAME = new Map(
  ALL_COUNTRIES.map((country) => [country.name.trim().toLowerCase(), country] as const)
);

const COUNTRY_NAME_ALIASES: Record<string, string> = {
  uae: "united arab emirates",
  usa: "united states",
  uk: "united kingdom",
};

const getCountryByName = (countryName?: string | null) => {
  const raw = String(countryName || "").trim().toLowerCase();
  if (!raw) return undefined;

  const alias = COUNTRY_NAME_ALIASES[raw];
  if (alias && COUNTRY_BY_NAME.has(alias)) return COUNTRY_BY_NAME.get(alias);

  if (COUNTRY_BY_NAME.has(raw)) return COUNTRY_BY_NAME.get(raw);

  for (const [name, country] of COUNTRY_BY_NAME.entries()) {
    if (name.includes(raw) || raw.includes(name)) return country;
  }

  return undefined;
};

export const sanitizePhoneDigits = (value: string | number | null | undefined): string =>
  String(value ?? "").replace(/\D/g, "");

export const formatPhoneDigitRule = (rule: Pick<PhoneDigitRule, "min" | "max">): string =>
  rule.min === rule.max ? `${rule.min}` : `${rule.min}-${rule.max}`;

export const isPhoneDigitsValidForRule = (
  phoneDigits: string,
  rule: Pick<PhoneDigitRule, "min" | "max">
): boolean => {
  const len = sanitizePhoneDigits(phoneDigits).length;
  return len >= rule.min && len <= rule.max;
};

export const getPhoneDigitRuleByIsoCode = (isoCode?: string | null): PhoneDigitRule => {
  const normalizedIso = String(isoCode || "").trim().toUpperCase();
  const country = COUNTRY_BY_ISO.get(normalizedIso);
  const mapped = PHONE_DIGIT_RULES_BY_ISO[normalizedIso];

  const min = mapped?.min ?? FALLBACK_RULE.min;
  const max = mapped?.max ?? FALLBACK_RULE.max;
  const dialCode = country?.phonecode ? `+${country.phonecode}` : undefined;

  return {
    min,
    max,
    isoCode: normalizedIso || country?.isoCode,
    dialCode,
    countryName: country?.name,
  };
};

export const getPhoneDigitRuleByCountryName = (
  countryName?: string | null
): PhoneDigitRule => {
  const country = getCountryByName(countryName);
  if (!country) {
    return {
      ...FALLBACK_RULE,
      countryName: countryName ? String(countryName) : undefined,
    };
  }
  return getPhoneDigitRuleByIsoCode(country.isoCode);
};
