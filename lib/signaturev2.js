const { jwtVerify, JWTVerifyOptions } = require('jose/jwt/verify');
const { createSecretKey, createHash, KeyObject } = require('crypto');

class VerifyOptions {
  /**
   * @param {boolean} validateURL If true, validate the hash of the URL, this ensure the protocol, hostname and query string of the request wasn't altered.
   * @param {boolean} validatePayload If true, validate the hash of the payload, this ensure the payload of the request wasn't altered.
   * @param {JWTVerifyOptions} jwtVerifyOptions Options to pass down to the jose library when verifying the JWT. Changing those options shouldn't be needed except for test to set the current time.
   * @param {*} jwtVerifyJti function taking a jti string as input and validating it, if the function return the jti is valid.
   */
  constructor(
    validateURL = true,
    validatePayload = true,
    jwtVerifyOptions = {
      issuer: 'MessageBird',
      algorithms: [
        'HS256', 'HS384', 'HS512'
      ],
      clockTolerance: 5
    },
    jwtVerifyJti = jti => true) {
    this.validateURL = validateURL;
    this.validatePayload = validatePayload;
    this.jwtVerifyOptions = jwtVerifyOptions;
    this.jwtVerifyJti = jwtVerifyJti;
  }
}

const DefaultVerifyOptions = new VerifyOptions();

/**
 * Verify a Signature-JWT of a MessageBird webhook.
 * This JWT is signed with a MessageBird account unique secret key, ensuring the request is from MessageBird and a specific account.
 * The JWT contains the following claims:
 * - "url_hash" the raw URL hashed with SHA256 ensuring the URL wasn't altered (validated by default, can be disabled)
 * - "payload_hash" the raw payload hashed with SHA256 ensuring the payload wasn't altered (validated by default, can be disabled)
 * - "jti" a unique token ID to implement an optional non-replay check (NOT validated by default)
 * - "iat" the issued at timestamp (validated by default)
 * - "exp" the expiration timestamp is ensuring that a request isn't captured and used at a later time. (validated by default)
 * - "iss" the issuer name, always MessageBird (validated by default)
 *
 * In case of an invalid signature, this function will throw an error otherwise it will return an empty promise.
 *
 * @param {string} url the raw url including the protocol, hostname and query string, https://example.com/?example=42
 * @param {Buffer} payload the raw payload
 * @param {string} jwt the jwt
 * @param {KeyObject} sk the MessageBird signature key
 * @param {VerifyOptions} opts validation options
 * @return {Promise} if the promise return without exception the signature is valid.
 */
function verify(url, payload, jwt, sk, opts = DefaultVerifyOptions) {
  return jwtVerify(jwt, sk, opts.jwtVerifyOptions).then(result => {
    if (!('jti' in result.payload)) {
      throw new Error('invalid Signature-JWT: missing jti claim');
    }

    if (!opts.jwtVerifyJti(result.payload.jti)) {
      throw new Error('invalid Signature-JWT: invalid jti');
    }

    if (opts.validateURL) {
      if (!('url_hash' in result.payload)) {
        throw new Error('invalid Signature-JWT: missing url_hash claim');
      }

      let computedURLHash = createHash('sha256').update(url).digest();
      let validUrlHash = Buffer.compare(
        Buffer.from(result.payload.url_hash, 'hex'),
        computedURLHash
      ) === 0;

      if (!validUrlHash) {
        throw new Error("invalid Signature-JWT: url_hash claim '" + result.payload.url_hash + "' doesn't match '" + computedURLHash.toString('hex') + "'");
      }
    }

    if (opts.validatePayload) {
      if ('payload_hash' in result.payload) {
        let computedPayloadHash = createHash('sha256').update(payload).digest();
        let validPayloadHash = Buffer.compare(
          Buffer.from(result.payload.payload_hash, 'hex'),
          computedPayloadHash
        ) === 0;

        if (!validPayloadHash) {
          throw new Error("invalid Signature-JWT: payload_hash claim '" + result.payload.payload_hash + "' doesn't match '" + computedPayloadHash.toString('hex') + "'");
        }
      } else if (payload) {
        throw new Error('invalid Signature-JWT: payload is not-empty but no payload_hash claim is present');
      }
    }

    return;
  }).catch(err => {
    throw new Error('invalid Signature-JWT: ' + err.message);
  });
}

// /**
//  * Try to infer original the protocol.
//  *
//  * @param {module:http/IncomingMessage} req
//  * @returns {string} https or http
//  */
// function getProtocol(req) {
//   if (
//     req.connection.encrypted
//     || (req.headers['forwarded'] != null && req.headers['forwarded'].includes('proto=https'))
//     || req.headers['x-forwarded-proto'] == "https"
//   ) {
//     return "https"
//   }
//   return "http"
// }

exports.verify = verify;
exports.VerifyOptions = VerifyOptions;
