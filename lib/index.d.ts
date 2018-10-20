declare namespace messagebird {
	interface MessageParameters {
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
	}

	interface VoiceParameters {
		/** The body of the SMS message. Required */
		body: string;
		/** The array of recipients msisdns. Required */
		recipients: string[];
		/** The sender of the message. A telephone number (including country code). */
		originator?: string;
		/** A client reference. */
		reference?: string;
		/**
		 * The language in which the message needs to be read to the recipient. Possible values are: cy-gb,da-dk,de-de,el-gr,en-au,en-gb,en-gb-wls,en-in,en-us,es-es,es-mx,es-us,fr-ca,fr-fr,id-id,is-is,it-it,ja-jp,ko-kr,ms-my,nb-no,nl-nl,pl-pl,pt-br,pt-pt,ro-ro,ru-ru,sv-se,ta-in,th-th,tr-tr,vi-vn,zh-cn,zh-hk. Default: en-gb
		 */
		language?: 'cy-gb' | 'da-dk' | 'de-de' | 'el-gr' | 'en-au' | 'en-gb' | 'en-gb-wls' | 'en-in' | 'en-us' | 'es-es' | 'es-mx' | 'es-us' | 'fr-ca' | 'fr-fr' | 'id-id' | 'is-is' | 'it-it' | 'ja-jp' | 'ko-kr' | 'ms-my' | 'nb-no' | 'nl-nl' | 'pl-pl' | 'pt-br' | 'pt-pt' | 'ro-ro' | 'ru-ru' | 'sv-se' | 'ta-in' | 'th-th' | 'tr-tr' | 'vi-vn' | 'zh-cn' | 'zh-hk';
		/** The voice in which the messages needs to be read to the recipient. Possible values are: male, female. Default: female */
		voice?: 'female' | 'male';
		/** The number of times the message needs to be repeated. Default: 1 */
		repeat?: number;
		/**
		 * What to do when a machine picks up the phone? Possible values are:
			- continue do not check, just play the message
			- delay if a machine answers, wait until the machine stops talking
			- hangup hangup when a machine answers
			Default is: delay.
		*/
		ifMachine?: 'continue' | 'delay' | 'hangup';
		/**
		 * The time (in milliseconds) to analyze if a machine has picked up the phone. Used in combination with the delay and hangup values of the ifMachine attribute. Minimum: 400, maximum: 10000. Default: 7000
		 */
		machineTimeout?: number;
		/** The scheduled date and time of the message in RFC3339 format (Y-m-d\TH:i:sP) */
		scheduledDatetime?: Date;
	}

	interface HLRParameter {
		/** The telephone number that you want to do a network query on. */
		msisdn: number | string;
		/** A client reference. */
		reference?: string;
	}

	interface VerifyParameter {
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
		 * Use plain when the body contains only GSM 03.38 characters, or you want non GSM 03.38 characters to be replaced. Use unicode to be able to send all characters. If you set auto, we will set unicode or plain depending on the body content.
		 * Note: Using unicode will limit the maximum number of characters tot 70 instead of 160. If message character size exceeds the limit, messages will be concatenated, resulting in separately billed messages. See this article for more information. 
		 * Default: plain */
		datacoding?: string;
		/** The verification code expiry time in seconds. Default: 30 */
		timeout?: number;
		/** The number of characters in the verification code. Must be between 6 and 10. Default: 6 */
		tokenLength?: number;
		/** The voice in which the messages needs to be read to the recipient. Possible values are: male, female. Default: female */
		voice?: 'female' | 'male';
		/**
		 * The language in which the message needs to be read to the recipient. Possible values are: cy-gb,da-dk,de-de,el-gr,en-au,en-gb,en-gb-wls,en-in,en-us,es-es,es-mx,es-us,fr-ca,fr-fr,id-id,is-is,it-it,ja-jp,ko-kr,ms-my,nb-no,nl-nl,pl-pl,pt-br,pt-pt,ro-ro,ru-ru,sv-se,ta-in,th-th,tr-tr,vi-vn,zh-cn,zh-hk. Default: en-gb
		 */
		language?: 'cy-gb' | 'da-dk' | 'de-de' | 'el-gr' | 'en-au' | 'en-gb' | 'en-gb-wls' | 'en-in' | 'en-us' | 'es-es' | 'es-mx' | 'es-us' | 'fr-ca' | 'fr-fr' | 'id-id' | 'is-is' | 'it-it' | 'ja-jp' | 'ko-kr' | 'ms-my' | 'nb-no' | 'nl-nl' | 'pl-pl' | 'pt-br' | 'pt-pt' | 'ro-ro' | 'ru-ru' | 'sv-se' | 'ta-in' | 'th-th' | 'tr-tr' | 'vi-vn' | 'zh-cn' | 'zh-hk';
	}

	interface ContactParameter {
		/** The phone number of the contact. Required */
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

	interface GroupParameter {
		/** The name of the group. Required */
		name: string;
	}

	type CallbackFn = (err: Error, res?: boolean | object) => void;

	interface MessageBird {
		balance: {
			read(callback: CallbackFn): void;
		},
		hlr: {
			read(id: string, callback: CallbackFn): void;
			create(msisdn: number | string, ref: string | CallbackFn , callback?: CallbackFn): void;
		},
		messages: {
			read(id: string, callback: CallbackFn): void;
			create(params: MessageParameters, callback: CallbackFn): void;
		},
		voice_messages: {
			read(id: string, callback: CallbackFn): void;
			create(recipients: string[] | VoiceParameters, params: VoiceParameters | CallbackFn, callback?: CallbackFn): void;
		},
		verify: {
			read(id: string, callback: CallbackFn): void;
			create(recipient: string | string[], params: VerifyParameter | CallbackFn, callback?: CallbackFn): void;
			delete(id: string, callback: CallbackFn): void;
			verify(id: string, token: string, callback: CallbackFn): void;
		},
		lookup: {
			read(phoneNumber: string, countryCode: string | CallbackFn, callback?: CallbackFn): void;
			hlr: {
				read(phoneNumber: string, countryCode: string | CallbackFn, callback?: CallbackFn): void;
				create(phoneNumber: string, params: HLRParameter | CallbackFn , callback?: CallbackFn): void;
			};
		},
		contacts: {
			create(phoneNumber: string, params: ContactParameter | CallbackFn, callback?: CallbackFn): void;
			delete(id: string, callback: CallbackFn): void;
			list(limit: number | CallbackFn, offset?: number, callback?: CallbackFn): void;
			read(id: string, callback: CallbackFn): void;
			update(id: string, params: ContactParameter, callback: CallbackFn): void;
			listGroups(contactId: string, limit?: number | CallbackFn, offset?: number, callback?: CallbackFn): void;
			listMessages(contactId: string, limit?: number | CallbackFn, offset?: number, callback?: CallbackFn): void;
		},
		groups: {
			create(name: string, params: GroupParameter | CallbackFn, callback?: CallbackFn): void;
			delete(id: string, callback: CallbackFn): void;
			list(limit: number | CallbackFn, offset?: number, callback?: CallbackFn): void;
			read(id: string, callback: CallbackFn): void;
			update(id: string, params: GroupParameter, callback: CallbackFn): void;
			addContacts(groupId: string, contactIds: string[], callback: CallbackFn): void;
			getAddContactsQueryString(contactIds: string[]): string;
			listContacts(groupId: string, limit?: number | CallbackFn, offset?: number, callback?: CallbackFn): void;
			removeContact(groupId: string, contactId: string, callback: CallbackFn): void;
		}
	}
}

/**
 * module.exports sets configuration
 * and returns an object with methods
 *
 * @param {String} accessKey
 * @param {Integer} timeout
 * @return {MessageBird}
 */
declare function messagebird(accessKey: string, timeout?: number): messagebird.MessageBird;

export = messagebird;
