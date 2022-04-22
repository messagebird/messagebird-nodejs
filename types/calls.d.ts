import { datetime } from './general';
import { languages } from './voice_messages';

export type transcribeLanguages =
  'de-DE' |
  'en-AU' |
  'en-UK' |
  'en-US' |
  'es-ES' |
  'es-LA' |
  'fr-FR' |
  'it-IT' |
  'nl-NL' |
  'pt-BR';

export interface Call {
  /** The unique ID of the call. */
  id: string;
  /** The status of the call. Possible values: queued, starting, ongoing, ended. */
  status: 'queued' | 'starting' | 'ongoing' | 'ended';
  /** The source number of the call, without leading +, ommited if not available */
  source: string;
  /** The destination number of the call, without leading +, ommited if not available */
  destination: string;
  /** The date-time the call was created, in RFC 3339 format (e.g. 2017-03-06T13:34:14Z). */
  createdAt: datetime;
  /** The date-time the call was last updated, in RFC 3339 format (e.g. 2017-03-06T13:34:14Z). */
  updatedAt: datetime;
  /** The date-time the call ended, in RFC 3339 format (e.g. 2017-03-06T13:34:14Z). */
  endedAt: datetime;
}

export interface CallParameter {
  source: string;
  /** The phone number of the contact */
  destination: string;
  /** The first name of the contact. */
  callFlow: CallFlowParameter;
}

export interface StepParameter {
  /** The name of the VoIP action. Possible values: transfer, say, play, pause, record, fetchCallFlow, sendKeys, hangup. */
  action: 'transfer' | 'say' | 'play' | 'pause' | 'record' | 'fetchCallFlow' | 'sendKeys' | 'hangup';
  /** Contains zero or more key-value pairs, where the key is the identifier of the option and value is the option value. */
  options?: StepOptions;
}

export interface CallFlowParameter {
  /** The title of the call flow. */
  title?: string;
  /** Says whether a full call recording is enabled on this call flow, the default value for this attribute is false. */
  record?: boolean;
  /** An array of step objects. The sequence of the array items describe the order of execution, where the first item will be executed first, than the second, etcetera. */
  steps: StepParameter[];
}

export interface StepOptions {
  /** The destination (E.164 formatted number, SIP URI or Client URI) to transfer a call to.  */
  destination?: string;
  /** The text to pronounce. Required when steps[].action is say. */
  payload?: string;
  /** The language of the text that is to be pronounced. */
  language?: languages;
  /** The preferred voice to use for pronouncing text. Required when steps[].action is say */
  voice?: 'male' | 'female';
  /** The amount of times to repeat the payload. Optional when steps[].action is say. Allowed values: Between 1 and 10. */
  repeat?: string;
  /** The URL(s) of the media file(s) to play. Required when steps[].action is play. */
  media?: string | object;
  /** The length of the pause in seconds. Required when steps[].action is pause. */
  length?: number;
  /**
   * Maximum length of a recording in seconds, when this time limit is reached, the recording will stop.
   * It is used when steps[].action is record and it is optional with the default value being 0 which means no limit.
   */
  maxLength?: number;
  /** Seconds of silence allowed before a recording is stopped. It is used when steps[].action is record and it is optional. If you omit this parameter, silence detection is disabled. */
  timeout?: number;
  /** Key DTMF input to terminate recording. Values allowed are any, #, *, none. It is used when steps[].action is record and it is optional with the default value being none. */
  finishOnKey?: 'any' | '#' | '*' | 'none';
  /** If you want to have a transcription of a recording, after the recording has finished. It is used when steps[].action is record and it is optional with the default value being false. */
  transcribe?: boolean;
  /** The language of the recording that is to be transcribed. Required when transcribe is true. */
  transcribeLanguage?: transcribeLanguages;
  /** Optional when steps[].action is transfer. Available options are in, out and both. */
  record?: 'in' | 'out' | 'both';
  /** The URL to fetch a call flow from. Required when steps[].action is fetchCallFlow. */
  url?: string;
  /** Optional when steps[].action is say */
  ifMachine?: 'continue' | 'delay' | 'hangup';
  /** Optional when steps[].action is say. The time (in milliseconds) to analyze if a machine has picked up the phone. */
  machineTimeout?: number;
  /** Optional when steps[].action is record. The onFinish is a URL from which a new call flow is fetched.  */
  onFinish?: string;
  /** Optional when steps[].action is transfer. Mask instructs MessageBird to use the proxy number (the called VMN for example) instead of the original caller ID. */
  mask?: boolean;
}
