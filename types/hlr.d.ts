import { datetime } from './general';

export interface Hlr {
  /** A unique random ID which is created on the MessageBird platform and is returned upon creation of the object. */
  id: string;
  /** The URL of the created object. */
  href: string;
  /** The telephone number. */
  msisdn: number;
  /** The [MCCMNC](https://en.wikipedia.org/wiki/Mobile_country_code) code of the network provider. */
  network: number;
  /** A client reference */
  reference: string;
  /** A hash with extra HLR information. See table below for extra information. */
  details: Details;
  /** The status of the msisdns. Possible values: sent, absent, active, unknown, and failed */
  status: string;
  /** The date and time of the creation of the message in RFC3339 format (Y-m-d\TH:i:sP) */
  createdDatetime: datetime;
  /** The datum time of the last status in RFC3339 format (Y-m-d\TH:i:sP) */
  statusDatetime: datetime;
}

export interface Details {
  /** Extended status information */
  status_desc?: string;
  /** IMSI (International Mobile Subscriber Identity) of mobile number */
  imsi?: string;
  /** Country ISO code of location of MSISDN */
  country_iso?: string;
  /** Country name of location of MSISDN */
  country_name?: string;
  /** MSC (Mobile Switching Center) of MSISDN */
  location_msc?: string;
  /** Country ISO of MSC (lowercase ISO 3166-1 alpha-2) */
  location_iso?: string;
  /** Is 1 if the phone number is ported or 0 when the phone number is not ported or ported status is unknown */
  ported?: 1 | 0;
  /** Is 1 if the phone number is roaming or 0 when the phone number is not roaming or roaming status is unknown */
  roaming?: 1 | 0;
}

export interface HLRParameter {
  /** The telephone number that you want to do a network query on. */
  msisdn: number | string;

  /** A client reference. */
  reference?: string;
}
