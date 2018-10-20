
export type CallbackFn = (err: Error, res?: boolean | object) => void;


export type MessageParameters = {
	/** The sender of the message. This can be a telephone number (including country code) or an alphanumeric string. In case of an alphanumeric string, the maximum length is 11 characters. Required */
	originator: string;
	/** The body of the SMS message. Required */
	body: string;
	/** The array of recipients msisdns. Note: can also contain groupIds. Required */
	recipients: string[];
	/** The type of message. Values can be: sms, binary, or flash. Default: sms */
	type?: 'sms' | 'binary' | 'flash';
	/** A client reference. */
	reference?: string;
	/** The status report URL to be used on a per-message basis. reference is required for a status report webhook to be sent. */
	reportUrl?: string;
	/** The amount of seconds that the message is valid. If a message is not delivered within this time, the message will be discarded. */
	validity?: number;
	/** The SMS route that is used to send the message. */
	gateway?: number;
	/** An hash with extra information. Is only used when a binary message is sent. */
	typeDetails?: string;
	/**
	 * Use plain when the body contains only GSM 03.38 characters, or you want non GSM 03.38 characters to be replaced. Use unicode to be able to send all characters. If you set auto, we will set unicode or plain depending on the body content.
	 * Note: Using unicode will limit the maximum number of characters tot 70 instead of 160. If message character size exceeds the limit, messages will be concatenated, resulting in separately billed messages. See this article for more information. 
	 * Default: plain */
	datacoding?: string;
	/** Indicated the message type. 1 is a normal message, 0 is a flash message. Default: 1 */
	mclass?: number;
	/** The scheduled date and time of the message in RFC3339 format (Y-m-d\TH:i:sP) */
	scheduledDatetime?: Date;	
};

export type MessageBird = {
	balance: {
		read(callback: CallbackFn): void;
	},
	hlr: {
		read(id: string, callback: CallbackFn): void;
		read(phoneNumber: string, countryCode: string | CallbackFn, callback?: CallbackFn): void;
		create(msisdn: number, ref: string | CallbackFn , callback?: CallbackFn): void;
		create(phoneNumber: string, params: object | CallbackFn , callback?: CallbackFn): void;
	},
	messages: {
		read(id: string, callback: CallbackFn): void;
		create(params: MessageParameters, callback: CallbackFn): void;
	},
	voice_messages: {
		read(id: string, callback: CallbackFn): void;
		create(recipients: string[] | object, params: object | CallbackFn, callback?: CallbackFn): void;
	},
	verify: {
		read(id: string, callback: CallbackFn): void;
		create(recipient: number, params: object | CallbackFn, callback?: CallbackFn): void;
		delete(id: string, callback: CallbackFn): void;
		verify(id: string, token: string, callback: CallbackFn): void;
	},
	lookup: {
		read(phoneNumber: string, countryCode: string | CallbackFn, callback?: CallbackFn): void;
		hlr: (phoneNumber: string, countryCode: string, callback: Function) => {};
		create: (phoneNumber: string, params: object, callback: Function) => {};
	},
}

declare function messagebird(accessKey: string, timeout?: number): MessageBird;

export default messagebird;
