import { datetime } from './general';
import { languages } from './voice_messages';
import { StepParameter } from './calls';

export interface CallFlow {
    /** The unique ID of the call flow. */
    id: string;
    title?: string;
    /** Says whether a full call recording is enabled on this call flow, the default value for this attribute is false. */
    record: boolean;
    /** An array of step objects. The sequence of the array items describe the order of execution, where the first item will be executed first, than the second, etcetera. */
    steps: StepParameter[];
    /** The default attribute says whether the call flow will be used when no call flow was found for an inbound number. Only one default call flow is allowed. */
    default?: boolean;
    /** The date-time the call was created, in RFC 3339 format (e.g. 2017-03-06T13:34:14Z). */
    createdAt?: datetime;
    /** The date-time the call was last updated, in RFC 3339 format (e.g. 2017-03-06T13:34:14Z). */
    updatedAt?: datetime;
}
