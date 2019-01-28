import { datetime } from './general';

export interface Contact {
  /** A unique random ID which is created on the MessageBird platform and is returned upon creation of the object. */
  id: string;
  /** The URL of the created object. */
  href: string;
  /** The phone number of contact. */
  msisdn: number;
  /** The first name of the contact. */
  firstName: string;
  /** The last name of the contact. */
  lastName: string;
  /** Custom fields of the contact. */
  customDetails: CustomDetails;

  groups: Groups;
  messages: Messages;
  /** The date and time of the creation of the contact in RFC3339 format (Y-m-d\TH:i:sP). */
  createdDatetime: datetime;
  /** The date and time of the last update of the contact in RFC3339 format (Y-m-d\TH:i:sP). */
  updatedDatetime: datetime;
}

export interface CustomDetails {
  /** Custom fields of the contact. */
  custom1: string;
  /** Custom fields of the contact. */
  custom2: string;
  /** Custom fields of the contact. */
  custom3: string;
  /** Custom fields of the contact. */
  custom4: string;
}
export interface Groups {
  /** The total count of groups that contact belongs to. */
  totalCount: number;
  /** URL which can be used to retrieve list of groups contact belongs to. */
  href: string;
}
export interface Messages {
  /** The total count of messages sent to contact. */
  totalCount: number;
  /** URL which can be used to retrieve list of messages sent to contact. */
  href: string;
}

export interface ContactParameter {
  /** The phone number of the contact */
  msisdn: string;

  /** The first name of the contact. */
  firstName?: string;

  /** The last name of the contact. */
  lastName?: string;

  /** Custom fields of the contact. */
  custom1?: string;

  /** Custom fields of the contact. */
  custom2?: string;

  /** Custom fields of the contact. */
  custom3?: string;

  /** Custom fields of the contact. */
  custom4?: string;
}
