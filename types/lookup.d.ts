import { datetime } from './general';
import { Hlr } from './hlr';

export type numberType =
  | 'fixed line'
  | 'mobile'
  | 'fixed line or mobile'
  | 'toll free'
  | 'premium rate'
  | 'shared cost'
  | 'voip'
  | 'personal number'
  | 'pager'
  | 'universal access number'
  | 'voice mail'
  | 'unknown';

export interface Lookup {
  /** The URL of this lookup. */
  href: string;

  /** The country code for this number in ISO 3166-1 alpha-2 format. */
  countryCode: string;

  /** The country calling code for this number. */
  countryPrefix: number;

  /** The phone number in E.164 format without the prefixed plus-sign. */
  phoneNumber: number;

  /** The type of number. */
  type: numberType;

  /** A hash containing references to this phone number in several different formats. */
  formats: NumberFormat;

  /** The most recent HLR object. If no such HLR objects exists, this hash won't be returned. */
  hlr: Hlr;
}

export interface NumberFormat {
  /** The phone number in E.164 format. */
  e164: string;

  /** The phone number in international format. */
  international: string;

  /** The phone number in national/local format. */
  national: string;

  /** The phone number in RFC3966 format. */
  rfc3966: string;
}
