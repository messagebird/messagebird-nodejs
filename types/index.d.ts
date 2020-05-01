// TypeScript Version: 3.0

import { Balance } from './balance';
import { Hlr, HLRParameter } from './hlr';
import { Message, MessageParameters, FilterParameters } from './messages';
import {
  VoiceMessage,
  VoiceParameters,
  VoiceParametersWithRecipients
} from './voice_messages';
import { msisdn } from './general';
import { Verify, VerifyParameter } from './verify';
import { Lookup } from './lookup';
import { Contact, ContactParameter } from './contact';
import { GroupParameter } from './group';
import { Recording } from './recordings';
import { Call, CallParameter, CallFlowParameter } from './calls';
import { CallFlow } from './callflows';
import {
  ConversationParameter,
  SendResponse,
  UpdateConversationParameters,
  ReplyConversationParameters,
  Webhooks,
  StartConversationParameter,
  StartConversationResponse
} from './conversations';
import { Webhooks as VoiceWebhooks } from './voice';
import { MmsObject, MmsParameter } from './mms';
import { Features } from './feature';
import { TranscriptionData } from './transcriptions';

type CallbackFn<T = unknown> = (err: Error | null, res: T | null) => void;

export interface MessageBird {
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
    list(filter: FilterParameters, callback: CallbackFn<Message[]>): void;
  };
  callflows: {
    read(id: string, callback: CallbackFn<CallFlow>): void;
    list(page: number, perPage: number, callback: CallbackFn<CallFlow[]>): void;
    list(callback: CallbackFn<CallFlow[]>): void;
    delete(id: string, callback: CallbackFn): void;
    update(id: string, params: CallFlowParameter, callback: CallbackFn): void;
    create(params: CallFlowParameter, callback: CallbackFn<CallFlow>): void;
  };
  voice_messages: {
    list(limit: number, offset: number, callback: CallbackFn<VoiceMessage[]>): void;
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
    list(limit: number, offset: number, callback: CallbackFn<Contact[]>): void;
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
  conversations: {
    /**
     * Sends a new message to a channel-specific user identifier (e.g. phone
     * number). If an active conversation already exists for the recipient,
     * this conversation will be resumed. If an active conversation does not
     * exist, a new one will be created.
     */
    send(
      params: ConversationParameter,
      callback: CallbackFn<SendResponse>
    ): void;
    /**
     * Starts a new conversation from a channel-specific user identifier,
     * such as a phone number, and sends a first message. If an active
     * conversation already exists for the recipient, this conversation will
     * be resumed.
     */
    start(params: StartConversationParameter, callback: CallbackFn<StartConversationResponse>): void;
    /**
     * Retrieves all conversations for this account. By default,
     * conversations are sorted by their lastReceivedDatetime field so that
     * conversations with new messages appear first.
     */
    list(limit: number, offset: number, callback: CallbackFn): void;
    /**
     * Retrieves a single conversation.
     */
    read(id: string, callback: CallbackFn): void;
    /**
     * Update Conversation Status.
     */
    update(
      id: string,
      params: UpdateConversationParameters,
      callback: CallbackFn
    ): void;
    /**
     * Adds a new message to an existing conversation and sends it to the
     * contact that you're in conversation with.
     */
    reply(
      id: string,
      params: ReplyConversationParameters,
      callback: CallbackFn
    ): void;
    /**
     * Lists the messages for a contact.
     */
    listMessages(
      contactId: string,
      limit: number,
      offset: number,
      callback: CallbackFn
    ): void;
    /**
     * View a message
     */
    readMessage(id: string, callback: CallbackFn): void;

    webhooks: {
      /**
       * Creates a new webhook.
       */
      create(params: Webhooks.CreateParameters, callback: CallbackFn): void;
      /**
       * Retrieves an existing webhook by id.
       */
      read(id: string, callback: CallbackFn): void;
      /**
       * Updates a webhook.
       */
      update(
        id: string,
        params: Webhooks.UpdateParameters,
        callback: CallbackFn
      ): void;
      /**
       * Retrieves a list of webhooks.
       */
      list(limit: number, offset: number, callback: CallbackFn): void;
      /**
       * Deletes webhook
       */
      delete(id: string, callback: CallbackFn): void;
    };
    /**
     * MessageBird's MMS Messaging API enables you to send and receive MMS messages to and from a selected group of countries. Currently you can only send MMS within the US and Canada.
     *
     * Messages are identified by a unique ID. And with this ID you can always check the status of the MMS message through the provided endpoint.
     */
    mms: {
      /**
       * Retrieves the information of an existing sent MMS message. You only need to supply the unique message id that was returned upon creation.
       */
      read(id: string, callback: CallbackFn<MmsObject>): void;

      /**
       *
       * Creates a new MMS message object. MessageBird returns the created message object with each request. Per request, a max of 50 recipients can be entered.
       */
      create(params: MmsParameter, callback: CallbackFn<MmsObject>): void;

      list(limit: number, offset: number, callback: CallbackFn): void;

      delete(id: string, callback: CallbackFn): void;
    };
  };
  /**
   * A recording describes a voice recording of a leg. You can initiate a recording of a leg by having a step in your callflow with the record action set.
   */
  calls: {
    /**
     * This request initiates an outbound call.
     */
    create(params: CallParameter, callback: CallbackFn<Call>): void;
    /**
     * This request retrieves a listing of all calls.
     */
    list(callback: CallbackFn<Call[]>): void;
    /**
     * This request retrieves a call resource. The single parameter is the unique ID that was returned upon creation.
     */
    read(callId: string, callback: CallbackFn<Call>): void;
    /**
     * This request will hang up all the legs of the call.
     */
    delete(callId: string, callback: CallbackFn): void;
  };
  /**
   * A recording describes a voice recording of a leg. You can initiate a recording of a leg by having a step in your callflow with the record action set.
   */
  recordings: {
    /**
     * Lists all recordings
     */
    list(callId: string, legId: string, limit: number, offset: number, callback: CallbackFn<Recording[]>): void;
    /**
     * This request retrieves a recording resource. The parameters are the unique ID of the recording, the leg and the call with which the recording is associated.
     */
    read(callId: string, legId: string, recordingId: string, callback: CallbackFn<Recording>): void;
    /**
     * Downloads a recording
     */
    download(callId: string, legId: string, recordingId: string, callback: CallbackFn): void;
  };
  /**
   * A transcription is a textual representation of a recording as text.
   */
  transcriptions: {
    /**
     * Creates a new transcription
     */
    create(callId: string, legId: string, recordingId: string, language: string, callback: CallbackFn<TranscriptionData>): void;
    /**
     * Lists all transcriptions
     */
    list(callId: string, legId: string, recordingId: string, callback: CallbackFn<TranscriptionData>): void;
    /**
     * Retrieves a transcription
     */
    read(callId: string, legId: string, recordingId: string, transcriptionId: string, callback: CallbackFn<TranscriptionData>): void;
    /**
     * Downloads a transcription
     */
    download(callId: string, legId: string, recordingId: string, transcriptionId: string, callback: CallbackFn<boolean|string>): void;
  };
  voice: {

    webhooks: {
      /**
       * Creates a new webhook.
       */
      create(params: VoiceWebhooks.CreateParameters, callback: CallbackFn): void;
      /**
       * Retrieves an existing webhook by id.
       */
      read(id: string, callback: CallbackFn): void;
      /**
       * Updates a webhook.
       */
      update(
        id: string,
        params: VoiceWebhooks.UpdateParameters,
        callback: CallbackFn
      ): void;
      /**
       * Retrieves a list of webhooks.
       */
      list(limit: number, offset: number, callback: CallbackFn): void;
      /**
       * Deletes webhook
       */
      delete(id: string, callback: CallbackFn): void;

    }
  };
}

export * from './balance';
export * from './callflows';
export * from './calls';
export * from './contact';
export * from './conversations';
export * from './feature';
export * from './hlr';
export * from './lookup';
export * from './messages';
export * from './mms';
export * from './recordings';
export * from './transcriptions';

export default function messagebird(accessKey: string, timeout?: number, features?: ReadonlyArray<Features>): MessageBird;
