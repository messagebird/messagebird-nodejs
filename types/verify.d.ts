import { msisdn, datetime } from './general';
import { dataCoding } from './messages';
import { languages } from './voice_messages';

export interface Verify {
  /** A unique random ID which is created on the MessageBird platform and is returned upon creation of the object */
  id: string;
  /** The URL of the created object. */
  href: string;
  /** The msisdn of the recipient */
  recipient: msisdn;
  /** A client reference */
  reference: string;
  messages: {
    /** The entry can either refer to either the messages or the voicemessages endpoint */
    href: string;
  };
  /** The status of the verification. Possible values: sent, expired, failed, verified, and deleted */
  status: string;
  /** The date and time of the creation of the Verify object in RFC3339 format (Y-m-d\TH:i:sP) */
  createdDatetime: datetime;
  /** The date and time indicating the expiration time of the Verify object in RFC3339 format (Y-m-d\TH:i:sP) */
  validUntilDatetime: datetime;
}

export interface VerifyParameter {
  /**
   * The sender of the message. This can be a telephone number (including country code) or an alphanumeric string. In case of an alphanumeric string, the maximum length is 11 characters.
   * Default: Code
   */
  originator?: string;

  /** A client reference. */
  reference?: string;

  /**
   * The type of message. Values can be: sms, flash, tts
   * Default: sms
   */
  type?: 'sms' | 'flash' | 'tts';

  /**
   * The template of the message body. Needs to contain %token for the verification code to be included.
   * Default: Your code is: %token
   */
  template?: string;

  /**
   * Use plain when the body contains only GSM 03.38 characters, or you want non GSM 03.38 characters to be replaced. Use unicode to be able to send all characters.
   * If you set auto, we will set unicode or plain depending on the body content.
   * Note: Using unicode will limit the maximum number of characters tot 70 instead of 160.
   * If message character size exceeds the limit, messages will be concatenated, resulting in separately billed messages.
   * Default: plain
   */
  datacoding?: dataCoding;

  /** The verification code expiry time in seconds. Default: 30 */
  timeout?: number;

  /** The number of characters in the verification code. Must be between 6 and 10. Default: 6 */
  tokenLength?: number;

  /** The voice in which the messages needs to be read to the recipient. Possible values are: male, female. Default: female */
  voice?: 'female' | 'male';

  /**
   * The language in which the message needs to be read to the recipient. Default: en-gb
   */
  language?: languages;
}
