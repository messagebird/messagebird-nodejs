// TypeScript Version: 3.0

import { Balance } from './balance';
import { Hlr, HLRParameter } from './hlr';
import { Message, MessageParameters } from 'messages';
import {
  VoiceMessage,
  VoiceParameters,
  VoiceParametersWithRecipients
} from 'voice_messages';
import { msisdn } from 'general';
import { Verify, VerifyParameter } from 'verify';
import { Lookup } from 'lookup';
import { Contact, ContactParameter } from 'contact';
import { GroupParameter } from 'group';

declare namespace messagebird {
  type CallbackFn<T = unknown> = (err: Error | null, res: T | null) => void;

  interface MessageBird {
    balance: {
      /** Get account balance */
      read(callback: CallbackFn<Balance>): void;
    };
    hlr: {
      read(id: string, callback: CallbackFn<Hlr>): void;
      create(msisdn: msisdn, callback?: CallbackFn<Hlr>): void;
      create(msisdn: msisdn, ref: string, callback: CallbackFn<Hlr>): void;
    };
    messages: {
      read(id: string, callback: CallbackFn<Message>): void;
      create(params: MessageParameters, callback: CallbackFn<Message>): void;
    };
    voice_messages: {
      read(id: string, callback: CallbackFn<VoiceMessage>): void;
      create(
        recipients: msisdn[],
        params: VoiceParameters,
        callback: CallbackFn<VoiceMessage>
      ): void;
      create(
        params: VoiceParametersWithRecipients,
        callback: CallbackFn<VoiceMessage>
      ): void;
    };
    verify: {
      read(id: string, callback: CallbackFn<Verify>): void;
      create(
        recipient: msisdn | [msisdn],
        params: VerifyParameter,
        callback: CallbackFn<Verify>
      ): void;
      create(recipient: msisdn | [msisdn], callback: CallbackFn<Verify>): void;
      delete(id: string, callback: CallbackFn<void>): void;
      verify(
        /** A unique random ID which is created on the MessageBird platform and is returned upon creation of the object. */
        id: string,
        /** An unique token which was sent to the recipient upon creation of the object. */
        token: string,
        callback: CallbackFn<Verify>
      ): void;
    };
    lookup: {
      read(
        phoneNumber: msisdn,
        countryCode: string,
        callback: CallbackFn<Lookup>
      ): void;
      read(phoneNumber: msisdn, callback: CallbackFn<Lookup>): void;
      hlr: {
        read(
          phoneNumber: msisdn,
          countryCode: string,
          callback: CallbackFn<Hlr>
        ): void;
        read(phoneNumber: msisdn, callback: CallbackFn<Hlr>): void;
        create(
          phoneNumber: msisdn,
          params: HLRParameter,
          callback: CallbackFn<Hlr>
        ): void;
        create(phoneNumber: msisdn, callback: CallbackFn<Hlr>): void;
      };
    };
    contacts: {
      create(
        phoneNumber: string,
        params: ContactParameter,
        callback: CallbackFn<Contact>
      ): void;
      create(phoneNumber: string, callback: CallbackFn<Contact>): void;
      delete(id: string, callback: CallbackFn<void>): void;
      list(
        limit: number,
        offset: number,
        callback: CallbackFn<Contact[]>
      ): void;
      list(callback: CallbackFn<Contact[]>): void;
      read(id: string, callback: CallbackFn<Contact>): void;
      update(
        id: string,
        params: ContactParameter,
        callback: CallbackFn<Contact>
      ): void;
      listGroups(
        contactId: string,
        limit: number,
        offset: number,
        callback: CallbackFn
      ): void;
      listGroups(contactId: string, callback: CallbackFn): void;
      listMessages(contactId: string, callback: CallbackFn): void;
      listMessages(
        contactId: string,
        limit: number,
        offset: number,
        callback: CallbackFn
      ): void;
    };
    groups: {
      create(name: string, params: GroupParameter, callback: CallbackFn): void;
      create(name: string, callback: CallbackFn): void;
      delete(id: string, callback: CallbackFn): void;
      list(limit: number, offset: number, callback: CallbackFn): void;
      list(callback: CallbackFn): void;
      read(id: string, callback: CallbackFn): void;
      update(id: string, params: GroupParameter, callback: CallbackFn): void;
      addContacts(
        groupId: string,
        contactIds: string[],
        callback: CallbackFn
      ): void;
      getAddContactsQueryString(contactIds: string[]): string;
      listContacts(
        groupId: string,
        limit: number,
        offset: number,
        callback: CallbackFn
      ): void;
      listContacts(groupId: string, callback: CallbackFn): void;
      removeContact(
        groupId: string,
        contactId: string,
        callback: CallbackFn
      ): void;
    };
  }
}

declare function messagebird(
  accessKey: string,
  timeout?: number
): messagebird.MessageBird;

export = messagebird;
