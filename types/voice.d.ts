export namespace Webhooks {
  interface CreateParameters {
    /** The endpoint URL that requests should be sent to. */
    url: string;
    /** The secret used for signing a webhook request. */
    token: string;
  }

  interface UpdateParameters {
    /** The secret used for signing a webhook request. */
    token: string;
  }
}
