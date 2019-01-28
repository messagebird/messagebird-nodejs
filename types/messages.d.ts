import { datetime, msisdn } from './general';

export type dataCoding = 'plain' | 'unicode' | 'auto';
export type mclass = 0 | 1;
export type messageType = 'sms' | 'binary' | 'flash';

export interface Message {
  /** A unique random ID which is created on the MessageBird platform and is returned upon creation of the object. */
  id: string;
  /** The URL of the created object. */
  href: string;
  /**
   * Tells you if the message is sent or received.
   *
   * `mt`: mobile terminated (sent to mobile)
   *
   * `mo`: mobile originated (received from mobile)
   */
  direction: 'mt' | 'mo';
  /** The type of message. */
  type: messageType;
  /**
   * The sender of the message.
   *
   * This can be a telephone number (including country code) or an alphanumeric string.
   * In case of an alphanumeric string, the maximum length is 11 characters.
   * You can set a default originator in your account or use inbox to use the Sticky VMN feature.
   */
  originator: msisdn;
  /** The body of the SMS message. */
  body: string;
  /** A client reference. */
  reference: null;
  /** The status report URL to be used on a per-message basis. `reference` is required for a status report webhook to be sent. */
  reportUrl: string;
  /** The amount of seconds that the message is valid. If a message is not delivered within this time, the message will be discarded. */
  validity: number;
  /** The SMS route that is used to send the message. */
  gateway: number;
  typeDetails: TypeDetails;
  /** The datacoding used, can be plain (GSM 03.38 characters only), unicode (contains non-GSM 03.38 characters) or auto, we will then set unicode or plain depending on the body content. */
  datacoding: dataCoding;
  /** Indicated the message type. 1 is a normal message, 0 is a flash message. (0-3 are valid values) */
  mclass: mclass;
  /** The scheduled date and time of the message in RFC3339 format (Y-m-d\TH:i:sP) */
  scheduledDatetime: datetime;
  /** The date and time of the creation of the message in RFC3339 format (Y-m-d\TH:i:sP) */
  createdDatetime: datetime;
  recipients: Recipients;
}

export interface TypeDetails {
  /** The [UDH](https://en.wikipedia.org/wiki/User_Data_Header) to prepend to the message payload. This can be used for sending concatenated SMS. Often required to send binary messages. */
  udh?: string;
}

export interface Recipients {
  /** The total count of recipients. */
  totalCount: number;
  /** The count of recipients that have the message pending (status sent, and buffered). */
  totalSentCount: number;
  /** The count of recipients where the message is delivered (status delivered). */
  totalDeliveredCount: number;
  /** The count of recipients where the delivery has failed (status delivery_failed). */
  totalDeliveryFailedCount: number;
  items: Recipient[];
}

export interface Recipient {
  /** The msisdn of the recipient */
  recipient: number;
  /** The status of the message sent to the recipient */
  status:
    | 'scheduled'
    | 'sent'
    | 'buffered'
    | 'delivered'
    | 'expired'
    | 'delivery_failed';
  /** The datum time of the last status in RFC3339 format (Y-m-d\TH:i:sP) */
  statusDatetime: datetime;
}

export interface MessageParameters {
  /** The sender of the message. This can be a telephone number (including country code) or an alphanumeric string. In case of an alphanumeric string, the maximum length is 11 characters. */
  originator: msisdn;

  /** The body of the SMS message. */
  body: string;

  /** The array of recipients msisdns. Note: can also contain groupIds. */
  recipients: msisdn[];

  /**
   * The type of message. Values can be: sms, binary, or flash.
   */
  type?: messageType;

  /** A client reference. */
  reference?: string;

  /** The status report URL to be used on a per-message basis. reference is required for a status report webhook to be sent. */
  reportUrl?: string;

  /** The amount of seconds that the message is valid. If a message is not delivered within this time, the message will be discarded. */
  validity?: number;

  /** The SMS route that is used to send the message. */
  gateway?: number;

  /** An hash with extra information. Is only used when a binary message is sent. */
  typeDetails?: TypeDetails;

  /**
   * Use plain when the body contains only GSM 03.38 characters, or you want non GSM 03.38 characters to be replaced.
   * Use unicode to be able to send all characters.
   * If you set auto, we will set unicode or plain depending on the body content.
   */
  datacoding?: dataCoding;

  /** Indicated the message type. 1 is a normal message, 0 is a flash message. Default: 1 */
  mclass?: mclass;

  /** The scheduled date and time of the message in RFC3339 format (Y-m-d\TH:i:sP) */
  scheduledDatetime?: datetime;
}
