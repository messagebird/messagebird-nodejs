import { datetime, msisdn } from './general';
import { Recipients } from './messages';

export interface MmsObject {
  /** A unique ID which is created on the MessageBird platform and is returned upon creation of the object. */
  id: string;

  /** The URL of the created object. */
  href: string;

  /**
   * Tells you if the message is sent or received.
   * mt: mobile terminated (sent to mobile)
   * mo: mobile originated (received from mobile)
   */
  direction: 'mt' | 'mo';

  /** The sender/source address of the message. This has to be the dedicated MMS virtual mobile number (including country code) for either the US/CA. */
  originator: string;

  recipients: Recipients;

  /** The subject of the MMS message. */
  subject: string;

  /** The body of the MMS message. */
  body: string;

  /** An array with URL's to the media attachments you want to send as part of the MMS message. */
  mediaUrls: string[];

  /** A client reference */
  reference: string;

  /** The scheduled date and time of the message in RFC3339 format (Y-m-d\TH:i:sP) */
  scheduledDatetime: datetime;

  /** The date and time of the creation of the message in RFC3339 format (Y-m-d\TH:i:sP) */
  createdDatetime: datetime;
}

export interface BasicMmsParameter {
  /* The sender of the message. This can be a telephone number (including country code - E.164) or an alphanumeric string. In case of an alphanumeric string, the maximum length is 11 characters.*/
  originator: msisdn;
  /* The array of recipients MSISDNs, E.164 formatted */
  recipients: msisdn[];

  /* The subject of the MMS message, UTF-8 encoded */
  subject?: string;
  /* A client reference */
  reference?: string;
  /* The scheduled date and time of the message in RFC3339 format (Y-m-d\TH:i:sP) */
  scheduledDatetime?: datetime;
}

export interface MmsBodyOnlyParameter extends BasicMmsParameter {
  /* The body of the MMS message, UTF-8 encoded. */
  body: string;
}
export interface MmsMediaUrlsOnlyParameter extends BasicMmsParameter {
  /* Array of URL's of attachments of the MMS message. See media attachmentsfor more information about attachments. Body or mediaUrls is required */
  mediaUrls: string[];
}

export interface MmsMediaUrlsAndBodyParameter
  extends MmsBodyOnlyParameter,
    MmsMediaUrlsOnlyParameter {}

export type MmsParameter =
  | MmsBodyOnlyParameter
  | MmsMediaUrlsOnlyParameter
  | MmsMediaUrlsAndBodyParameter;
