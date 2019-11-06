import { datetime } from './general';

export interface TranscriptionLinks {
  /**  URI for reading the text transcription */
  self: string;
  /**  URI for downloading the text transcription */
  file: string;
}

export interface Transcription {
  /** The unique ID of the transcription. */
  id: string;
  /** The format of the recording. Supported formats are: wav. */
  recordingId: string;
  /** In case that an error was occurred while executing the transcription request, it appears here. */
  error: string;
  /** The date-time the call was created, in RFC 3339 format (e.g. 2017-03-06T13:34:14Z) */
  createdAt: datetime;
  /** The date-time the call was last updated, in RFC 3339 format (e.g. 2017-03-06T13:34:14Z). */
  updatedAt: datetime;
  /** A hash with HATEOAS links related to the object. This includes the file link that has the URI for downloading the text transcription of a recording. */
  _links: TranscriptionLinks;
}

export interface TranscriptionData {
  /** Transcriptions */
  data: Transcription[];
}
