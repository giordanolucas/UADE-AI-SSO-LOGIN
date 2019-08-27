//lscache
function lscacheFactory() {
  // Prefix for all lscache keys
  var CACHE_PREFIX = "lscache-";

  // Suffix for the key name on the expiration items in localStorage
  var CACHE_SUFFIX = "-cacheexpiration";

  // expiration date radix (set to Base-36 for most space savings)
  var EXPIRY_RADIX = 10;

  // time resolution in milliseconds
  var expiryMilliseconds = 60 * 1000;
  // ECMAScript max Date (epoch + 1e8 days)
  var maxDate = calculateMaxDate(expiryMilliseconds);

  var cachedStorage;
  var cachedJSON;
  var cacheBucket = "";
  var warnings = false;

  // Determines if localStorage is supported in the browser;
  // result is cached for better performance instead of being run each time.
  // Feature detection is based on how Modernizr does it;
  // it's not straightforward due to FF4 issues.
  // It's not run at parse-time as it takes 200ms in Android.
  function supportsStorage() {
    var key = "__lscachetest__";
    var value = key;

    if (cachedStorage !== undefined) {
      return cachedStorage;
    }

    // some browsers will throw an error if you try to access local storage (e.g. brave browser)
    // hence check is inside a try/catch
    try {
      if (!localStorage) {
        return false;
      }
    } catch (ex) {
      return false;
    }

    try {
      setItem(key, value);
      removeItem(key);
      cachedStorage = true;
    } catch (e) {
      // If we hit the limit, and we don't have an empty localStorage then it means we have support
      if (isOutOfSpace(e) && localStorage.length) {
        cachedStorage = true; // just maxed it out and even the set test failed.
      } else {
        cachedStorage = false;
      }
    }
    return cachedStorage;
  }

  // Check to set if the error is us dealing with being out of space
  function isOutOfSpace(e) {
    return (
      e &&
      (e.name === "QUOTA_EXCEEDED_ERR" ||
        e.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        e.name === "QuotaExceededError")
    );
  }

  // Determines if native JSON (de-)serialization is supported in the browser.
  function supportsJSON() {
    /*jshint eqnull:true */
    if (cachedJSON === undefined) {
      cachedJSON = window.JSON != null;
    }
    return cachedJSON;
  }

  /**
   * Returns a string where all RegExp special characters are escaped with a \.
   * @param {String} text
   * @return {string}
   */
  function escapeRegExpSpecialCharacters(text) {
    return text.replace(/[[\]{}()*+?.\\^$|]/g, "\\$&");
  }

  /**
   * Returns the full string for the localStorage expiration item.
   * @param {String} key
   * @return {string}
   */
  function expirationKey(key) {
    return key + CACHE_SUFFIX;
  }

  /**
   * Returns the number of minutes since the epoch.
   * @return {number}
   */
  function currentTime() {
    return Math.floor(new Date().getTime() / expiryMilliseconds);
  }

  /**
   * Wrapper functions for localStorage methods
   */

  function getItem(key) {
    return localStorage.getItem(CACHE_PREFIX + cacheBucket + key);
  }

  function setItem(key, value) {
    // Fix for iPad issue - sometimes throws QUOTA_EXCEEDED_ERR on setItem.
    localStorage.removeItem(CACHE_PREFIX + cacheBucket + key);
    localStorage.setItem(CACHE_PREFIX + cacheBucket + key, value);
  }

  function removeItem(key) {
    localStorage.removeItem(CACHE_PREFIX + cacheBucket + key);
  }

  function eachKey(fn) {
    var prefixRegExp = new RegExp(
      "^" + CACHE_PREFIX + escapeRegExpSpecialCharacters(cacheBucket) + "(.*)"
    );
    // Loop in reverse as removing items will change indices of tail
    for (var i = localStorage.length - 1; i >= 0; --i) {
      var key = localStorage.key(i);
      key = key && key.match(prefixRegExp);
      key = key && key[1];
      if (key && key.indexOf(CACHE_SUFFIX) < 0) {
        fn(key, expirationKey(key));
      }
    }
  }

  function flushItem(key) {
    var exprKey = expirationKey(key);

    removeItem(key);
    removeItem(exprKey);
  }

  function flushExpiredItem(key) {
    var exprKey = expirationKey(key);
    var expr = getItem(exprKey);

    if (expr) {
      var expirationTime = parseInt(expr, EXPIRY_RADIX);

      // Check if we should actually kick item out of storage
      if (currentTime() >= expirationTime) {
        removeItem(key);
        removeItem(exprKey);
        return true;
      }
    }
  }

  function warn(message, err) {
    if (!warnings) return;
    if (!("console" in window) || typeof window.console.warn !== "function")
      return;
    window.console.warn("lscache - " + message);
    if (err) window.console.warn("lscache - The error was: " + err.message);
  }

  function calculateMaxDate(expiryMilliseconds) {
    return Math.floor(8.64e15 / expiryMilliseconds);
  }

  return {
    /**
     * Stores the value in localStorage. Expires after specified number of minutes.
     * @param {string} key
     * @param {Object|string} value
     * @param {number} time
     * @return true if the value was inserted successfully
     */
    set: function(key, value, time) {
      if (!supportsStorage()) return false;

      // If we don't get a string value, try to stringify
      // In future, localStorage may properly support storing non-strings
      // and this can be removed.

      if (!supportsJSON()) return false;
      try {
        value = JSON.stringify(value);
      } catch (e) {
        // Sometimes we can't stringify due to circular refs
        // in complex objects, so we won't bother storing then.
        return false;
      }

      try {
        setItem(key, value);
      } catch (e) {
        if (isOutOfSpace(e)) {
          // If we exceeded the quota, then we will sort
          // by the expire time, and then remove the N oldest
          var storedKeys = [];
          var storedKey;
          eachKey(function(key, exprKey) {
            var expiration = getItem(exprKey);
            if (expiration) {
              expiration = parseInt(expiration, EXPIRY_RADIX);
            } else {
              // TODO: Store date added for non-expiring items for smarter removal
              expiration = maxDate;
            }
            storedKeys.push({
              key: key,
              size: (getItem(key) || "").length,
              expiration: expiration
            });
          });
          // Sorts the keys with oldest expiration time last
          storedKeys.sort(function(a, b) {
            return b.expiration - a.expiration;
          });

          var targetSize = (value || "").length;
          while (storedKeys.length && targetSize > 0) {
            storedKey = storedKeys.pop();
            warn("Cache is full, removing item with key '" + key + "'");
            flushItem(storedKey.key);
            targetSize -= storedKey.size;
          }
          try {
            setItem(key, value);
          } catch (e) {
            // value may be larger than total quota
            warn(
              "Could not add item with key '" +
                key +
                "', perhaps it's too big?",
              e
            );
            return false;
          }
        } else {
          // If it was some other error, just give up.
          warn("Could not add item with key '" + key + "'", e);
          return false;
        }
      }

      // If a time is specified, store expiration info in localStorage
      if (time) {
        setItem(
          expirationKey(key),
          (currentTime() + time).toString(EXPIRY_RADIX)
        );
      } else {
        // In case they previously set a time, remove that info from localStorage.
        removeItem(expirationKey(key));
      }
      return true;
    },

    /**
     * Retrieves specified value from localStorage, if not expired.
     * @param {string} key
     * @return {string|Object}
     */
    get: function(key) {
      if (!supportsStorage()) return null;

      // Return the de-serialized item if not expired
      if (flushExpiredItem(key)) {
        return null;
      }

      // Tries to de-serialize stored value if its an object, and returns the normal value otherwise.
      var value = getItem(key);
      if (!value || !supportsJSON()) {
        return value;
      }

      try {
        // We can't tell if its JSON or a string, so we try to parse
        return JSON.parse(value);
      } catch (e) {
        // If we can't parse, it's probably because it isn't an object
        return value;
      }
    },

    /**
     * Removes a value from localStorage.
     * Equivalent to 'delete' in memcache, but that's a keyword in JS.
     * @param {string} key
     */
    remove: function(key) {
      if (!supportsStorage()) return;

      flushItem(key);
    },

    /**
     * Returns whether local storage is supported.
     * Currently exposed for testing purposes.
     * @return {boolean}
     */
    supported: function() {
      return supportsStorage();
    },

    /**
     * Flushes all lscache items and expiry markers without affecting rest of localStorage
     */
    flush: function() {
      if (!supportsStorage()) return;

      eachKey(function(key) {
        flushItem(key);
      });
    },

    /**
     * Flushes expired lscache items and expiry markers without affecting rest of localStorage
     */
    flushExpired: function() {
      if (!supportsStorage()) return;

      eachKey(function(key) {
        flushExpiredItem(key);
      });
    },

    /**
     * Appends CACHE_PREFIX so lscache will partition data in to different buckets.
     * @param {string} bucket
     */
    setBucket: function(bucket) {
      cacheBucket = bucket;
    },

    /**
     * Resets the string being appended to CACHE_PREFIX so lscache will use the default storage behavior.
     */
    resetBucket: function() {
      cacheBucket = "";
    },

    /**
     * @returns {number} The currently set number of milliseconds each time unit represents in
     *   the set() function's "time" argument.
     */
    getExpiryMilliseconds: function() {
      return expiryMilliseconds;
    },

    /**
     * Sets the number of milliseconds each time unit represents in the set() function's
     *   "time" argument.
     * Sample values:
     *  1: each time unit = 1 millisecond
     *  1000: each time unit = 1 second
     *  60000: each time unit = 1 minute (Default value)
     *  360000: each time unit = 1 hour
     * @param {number} milliseconds
     */
    setExpiryMilliseconds: function(milliseconds) {
      expiryMilliseconds = milliseconds;
      maxDate = calculateMaxDate(expiryMilliseconds);
    },

    /**
     * Sets whether to display warnings when an item is removed from the cache or not.
     */
    enableWarnings: function(enabled) {
      warnings = enabled;
    }
  };
}

var lscache = lscacheFactory();

//atob
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function InvalidCharacterError(message) {
  this.message = message;
}
InvalidCharacterError.prototype = new Error();
InvalidCharacterError.prototype.name = "InvalidCharacterError";

function atob(input) {
  var str = String(input).replace(/=+$/, "");
  if (str.length % 4 == 1) {
    throw new InvalidCharacterError(
      "'atob' failed: The string to be decoded is not correctly encoded."
    );
  }
  for (
    // initialize result and counters
    var bc = 0, bs, buffer, idx = 0, output = "";
    // get next character
    (buffer = str.charAt(idx++));
    // character found in table? initialize bit storage and add its ascii value;
    ~buffer &&
    ((bs = bc % 4 ? bs * 64 + buffer : buffer),
    // and if not first of each 4 characters,
    // convert the first 8 bits to one ascii character
    bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    // try to find character in table (0-63, not found => -1)
    buffer = chars.indexOf(buffer);
  }
  return output;
}

//Base64 Decode
function b64DecodeUnicode(str) {
  return decodeURIComponent(
    atob(str).replace(/(.)/g, function(m, p) {
      var code = p
        .charCodeAt(0)
        .toString(16)
        .toUpperCase();
      if (code.length < 2) {
        code = "0" + code;
      }
      return "%" + code;
    })
  );
}

function base64_url_decode(str) {
  var output = str.replace(/-/g, "+").replace(/_/g, "/");
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += "==";
      break;
    case 3:
      output += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }

  try {
    return b64DecodeUnicode(output);
  } catch (err) {
    return atob(output);
  }
}

//Token Decoder
function InvalidTokenError(message) {
  this.message = message;
}
InvalidTokenError.prototype = new Error();
InvalidTokenError.prototype.name = "InvalidTokenError";

function jwtDecode(token, options) {
  if (typeof token !== "string") {
    throw new InvalidTokenError("Invalid token specified");
  }

  options = options || {};
  var pos = options.header === true ? 0 : 1;
  try {
    return JSON.parse(base64_url_decode(token.split(".")[pos]));
  } catch (e) {
    throw new InvalidTokenError("Invalid token specified: " + e.message);
  }
}

/***********
 *** SSO ***
 ***********
 */

const BASE_SSO_URL = "https://uade-sso-login.herokuapp.com";
const LOCALSTORAGE_USER_KEY = "sso_user";
const LOCALSTORAGE_TOKEN_KEY = "sso_token";

function _getLoginUrl(tenantId, redirectUri) {
  return (
    BASE_SSO_URL + "/login?tenant=" + tenantId + "&redirect=" + redirectUri
  );
}

function _getLogoutUrl(tenantId, redirectUri) {
  return (
    BASE_SSO_URL + "/logout?tenant=" + tenantId + "&redirect=" + redirectUri
  );
}

function _saveUserToken(encodedToken) {
  let jsonToken = jwtDecode(encodedToken);

  let expireDate = 0;
  if (jsonToken["exp"]) {
    expireDate = new Date(jsonToken["exp"] * 1000);
  }

  let expireTime = 0;
  if (expireDate > 0) {
    expireTime = expireDate - new Date();
  }

  lscache.set(LOCALSTORAGE_USER_KEY, jsonToken, expireTime);
  lscache.set(LOCALSTORAGE_TOKEN_KEY, encodedToken, expireTime);
}

function SSOAuth(info) {
  this.info = info;
}

SSOAuth.prototype.login = function() {
  window.location.replace(
    _getLoginUrl(this.info.tenantId, this.info.loginCallback)
  );
};

SSOAuth.prototype.saveUserToken = function() {
  _saveUserToken(window.location.hash.substring(1));
};

SSOAuth.prototype.getJWT = function() {
  return lscache.get(LOCALSTORAGE_TOKEN_KEY);
};

SSOAuth.prototype.getJWTData = function() {
  return lscache.get(LOCALSTORAGE_USER_KEY);
};

SSOAuth.prototype.getUserId = function() {
  var jwtData = this.getJWTData();
  return jwtData.sub;
};

SSOAuth.prototype.logout = function() {
  lscache.remove(LOCALSTORAGE_USER_KEY);
  lscache.remove(LOCALSTORAGE_TOKEN_KEY);
  window.location.replace(
    _getLogoutUrl(this.info.tenantId, this.info.logoutCallback)
  );
};
