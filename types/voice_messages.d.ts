import { datetime, msisdn } from './general';

export type languages =
  | 'cy-gb'
  | 'da-dk'
  | 'de-de'
  | 'el-gr'
  | 'en-au'
  | 'en-gb'
  | 'en-gb-wls'
  | 'en-in'
  | 'en-us'
  | 'es-es'
  | 'es-mx'
  | 'es-us'
  | 'fr-ca'
  | 'fr-fr'
  | 'id-id'
  | 'is-is'
  | 'it-it'
  | 'ja-jp'
  | 'ko-kr'
  | 'ms-my'
  | 'nb-no'
  | 'nl-nl'
  | 'pl-pl'
  | 'pt-br'
  | 'pt-pt'
  | 'ro-ro'
  | 'ru-ru'
  | 'sv-se'
  | 'ta-in'
  | 'th-th'
  | 'tr-tr'
  | 'vi-vn'
  | 'zh-cn'
  | 'zh-hk';
export type voice = 'female' | 'male';

export interface VoiceMessage {
  /** 	A unique random ID which is created on the MessageBird platform and is returned upon creation of the object. */
  id: string;

  /** The URL of the created object. */
  href: string;

  /** A client reference */
  reference: string;

  /** The sender of the message. A telephone number (including country code). */
  originator: null;

  /** The body of the message. The maxlength is 1000 characters. */
  body: string;

  /** The language in which the message needs to be read to the recipient. */
  language: languages;

  /** The voice in which the messages needs to be read to the recipient. */
  voice: voice;

  /** The number of times the message needs to be repeated. Maximum is 10 times. */
  repeat: number;

  /**
   * What to do when a machine picks up the phone?
   *
   * Possible values are:
   * - `continue`: do not check, just play the message
   * - `delay`: if a machine answers, wait until the machine stops talking
   * - `hangup`: hangup when a machine answers
   */
  ifMachine: 'continue' | 'delay' | 'hangup';

  /**
   * The time (in milliseconds) to analyze if a machine has picked up the phone. Used in combination with the delay and hangup values of the ifMachine attribute.
   *
   * Minimum: 400, maximum: 10000.
   *
   * Default is: 7000.
   */
  machineTimeout: number;
  /** The scheduled date and time of the message in RFC3339 format (Y-m-d\TH:i:sP) */
  scheduledDatetime: datetime;
  /** The date and time of the creation of the message in RFC3339 format (Y-m-d\TH:i:sP) */
  createdDatetime: datetime;
  recipients: Recipients;
}
export interface Recipients {
  /** The total count of recipients. */
  totalCount: number;
  /** The count of recipients that have the message pending (status "calling"). */
  totalSentCount: number;
  /** The count of recipients where the message is delivered (status "answered"). */
  totalDeliveredCount: number;
  /** The count of recipients where the delivery has failed (status "failed", "busy", "machine"). */
  totalDeliveryFailedCount: number;
  items: Recipient[];
}
export interface Recipient {
  /** The msisdn of the recipient */
  recipient: number;
  /** The status of the message sent to the recipient. Possible values: . For future use the following status are reserved: "busy" and "machine" */
  status: 'calling' | 'answered' | 'failed';
  /** The datum time of the last status in RFC3339 format (Y-m-d\TH:i:sP) */
  statusDatetime: datetime;
}

export interface VoiceParameters {
  /** The body of the SMS message. */
  body: string;

  /** The sender of the message. A telephone number (including country code). */
  originator?: string;

  /** A client reference. */
  reference?: string;

  /**
   * The language in which the message needs to be read to the recipient.
   *
   * Default: en-gb
   */
  language?: languages;

  /**
   * The voice in which the messages needs to be read to the recipient.
   *
   * Default: female
   */
  voice?: voice;

  /**
   * The number of times the message needs to be repeated.
   *
   * Default: 1
   */
  repeat?: number;

  /**
   * What to do when a machine picks up the phone? Possible values are:
   * - continue do not check, just play the message
   * - delay if a machine answers, wait until the machine stops talking
   * - hangup hangup when a machine answers
   *
   * Default is: delay.
   */
  ifMachine?: 'continue' | 'delay' | 'hangup';

  /**
   * The time (in milliseconds) to analyze if a machine has picked up the phone. Used in combination with the delay and hangup values of the ifMachine attribute.
   *
   * Minimum: 400, maximum: 10000.
   *
   * Default: 7000
   */
  machineTimeout?: number;

  /** The scheduled date and time of the message in RFC3339 format (Y-m-d\TH:i:sP) */
  scheduledDatetime?: Date;
}

export interface VoiceParametersWithRecipients extends VoiceParameters {
  /** The array of recipients msisdns. */
  recipients: msisdn[];
}
