interface MessageBird {
	balance: {
		read: (callback: Function) => {};
	},
	hlr: {
		read: (id: string, callback: Function) => {};
		create: (msisdn: number, ref: string, callback: Function )=> {};
	},
	messages: {
		read: (id: string, callback: Function) => {};
		create: (params: any, callback: Function) => {};
	},
	voice_messages: {
		read: (id: string, callback: Function) => {};
		create: (recipients: any[], params: any, callback: Function) => {};
	},
	verify: {
		read: (id: string, callback: Function) => {};
		create: (recipient: number, params: any | Function, callback?: Function) => {};
		delete: (id: string, callback: Function) => {};
		verify: (id: string, token: string, callback: Function) => {};
	},
	lookup: {
		read: (phoneNumber: string, countryCode: string, callback: Function) => {};
		hlr: (phoneNumber: string, countryCode: string, callback: Function) => {};
		create: (phoneNumber: string, params: any, callback: Function) => {};
	}
}

declare function messagebird(accessKey: string, timeout?: number): MessageBird;

export = messagebird;
