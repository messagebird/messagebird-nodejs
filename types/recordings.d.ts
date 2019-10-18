import { datetime } from './general';

export interface Recording {
  /** The unique ID of the recording. */
  id: string;
  /** The format of the recording. Supported formats are: wav. */
  format: string;
  /** The ID of the leg that the recording belongs to. */
  legId: string;
  /** The status of the recording. Available statuses are: initialised, recording, done and failed */
  status: 'initialised' | 'recording' | 'done' | 'failed';
  /** The duration of the recording in seconds. */
  duration: number;
  /** The date-time the call was created, in RFC 3339 format (e.g. 2017-03-06T13:34:14Z) */
  createdAt: datetime;
  /** The date-time the call was last updated, in RFC 3339 format (e.g. 2017-03-06T13:34:14Z). */
  updatedAt: datetime;
}
