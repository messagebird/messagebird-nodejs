var crypto = require('crypto');
var querystring = require('querystring');
var Buffer = require('safe-buffer').Buffer;
var scmp = require('scmp');
var extend = Object.assign ? Object.assign : require('util')._extend;

var MESSAGEBIRD_REQUEST_TIMESTAMP = 'messagebird-request-timestamp';
var MESSAGEBIRD_REQUEST_SIGNATURE = 'messagebird-signature';
var MESSAGEBIRD_REQUEST_TIMEOUT = 100;
var MESSAGEBIRD_REQUEST_HASH = 'sha256';

/**
 * Returns request is expired or not.
 *
 * @param {Object} req
 * @return {Boolean}
 * @deprecated use webhookSignatureJwt.verify instead.
 */
function isRecent(req) {
  var timestamp = parseInt(req.headers[MESSAGEBIRD_REQUEST_TIMESTAMP], 10);
  var currentTime = Math.floor(new Date().getTime() / 1000);

  if (!timestamp) {
    throw new Error('The "MessageBird-Request-Timestamp" header is missing.');
  }

  if (!(new Date(timestamp * 1000).getTime() > 0)) {
    throw new Error('The "MessageBird-Request-Timestamp" has an invalid value.');
  }

  return (currentTime - timestamp) < MESSAGEBIRD_REQUEST_TIMEOUT;
}

/**
 * Returns signatures are equal or not.
 *
 * @param {Object} req
 * @param {Buffer} generatedSignature
 * @return {Boolean}
 * @deprecated use webhookSignatureJwt.verify instead.
 */
function isValid(req, generatedSignature) {
  var signature = req.headers[MESSAGEBIRD_REQUEST_SIGNATURE];

  if (!signature) {
    throw new Error('The "MessageBird-Signature" header is missing.');
  }

  return scmp(Buffer.from(signature, 'base64'), generatedSignature);
}

/**
 * Returns if object empty or not.
 * @param {Object} obj
 * @return {Boolean}
 */
function isEmpty(obj) {
  for (let prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }

  return true;
}

/**
 * Returns sorted queryString with parsed statusDatetime
 *
 * @param {Object} obj
 * @return {String}
 */
function stringifyQuery(query) {
  var normalizedDateTime = query.statusDatetime ? extend(query, { statusDatetime: query.statusDatetime.split(' ').join('+') }) : query;

  // The query string needs to be sorted, because we generate a hash from the query
  var sortedQuery = {};
  var keys = Object.keys(normalizedDateTime).sort();

  for (let i = 0; i < keys.length; i++) {
    sortedQuery[keys[i]] = normalizedDateTime[keys[i]];
  }
  return querystring.stringify(sortedQuery);
}

/**
 * Generates signature.
 *
 * @param {Object} req
 * @param {String} signingKey
 * @return {Buffer}
 * @deprecated use webhookSignatureJwt.verify instead.
 */
function generate(req, signingKey) {
  let getTimeAndQueryBuffer = function () {
    let timestamp = req.headers[MESSAGEBIRD_REQUEST_TIMESTAMP];
    let queryParams = stringifyQuery(req.query);

    return new Buffer.from(timestamp + '\n' + queryParams + '\n');
  };

  let getBodyBuffer = function () {
    let body = (!req.body || isEmpty(req.body)) ? '' : req.body;
    let bodyHash = crypto.createHash(MESSAGEBIRD_REQUEST_HASH).update(body).digest();

    return new Buffer.from(bodyHash);
  };

  if (!req.headers[MESSAGEBIRD_REQUEST_TIMESTAMP]) {
    throw new Error('The "MessageBird-Request-Timestamp" header is missing.');
  }

  let payload = new Buffer.concat([getTimeAndQueryBuffer(req), getBodyBuffer(req)]);

  return crypto.createHmac(MESSAGEBIRD_REQUEST_HASH, signingKey).update(payload).digest();
}

/**
 * Returns request is valid or not.
 *
 * @param {Object} req
 * @param {String} signingKey
 * @return {Boolean}
 * @deprecated use webhookSignatureJwt.verify instead.
 */
function validate(req, signingKey) {
  var signature = generate(req, signingKey);

  if (!isValid(req, signature)) {
    throw new Error('Signatures not match.');
  }

  if (!isRecent(req)) {
    throw new Error('Request expired.');
  }

  return true;
}

/**
 * Middleware for express.
 *
 * @param {String} signingKey
 * @return {Function}
 * @deprecated use webhookSignatureJwt.ExpressMiddlewareVerify instead.
 */
function middlewareWrapper(signingKey) {
  return function signatureMiddleware(req, res, next) {
    try {
      validate(req, signingKey);
      next();
    } catch (err) {
      next(err);
    }
  };
}

exports = module.exports = middlewareWrapper;
exports.isValid = isValid;
exports.isRecent = isRecent;
exports.generate = generate;
exports.validate = validate;
