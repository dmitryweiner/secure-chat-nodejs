var SecureChat = SecureChat || {};

SecureChat.RSA = (function () {

  var ownPrivatePrefix = 'rsa_own_private';
  var ownPublicPrefix = 'rsa_own_public';
  var publicPrefix  = 'rsa_public';

  function saveOwnPrivateKey(key) {
    SecureChat.LocalStorage.save(ownPrivatePrefix, key);
  }

  function getOwnPrivateKey() {
    return SecureChat.LocalStorage.load(ownPrivatePrefix);
  }

  function saveOwnPublicKey(key) {
    SecureChat.LocalStorage.save(ownPublicPrefix, key);
  }

  function getOwnPublicKey() {
    return SecureChat.LocalStorage.load(ownPublicPrefix);
  }


  function saveContactPublicKey(username, key) {
    SecureChat.LocalStorage.save(publicPrefix + '_' + username, key);
  }

  function getContactPublicKey(username) {
    return SecureChat.LocalStorage.load(publicPrefix + '_' + username);
  }

  function encrypt(message, receiver, key) {
    var encrypt = new JSEncrypt();
    if (key) {
      encrypt.setPublicKey(key);
    } else if (!receiver) {
      encrypt.setPublicKey(getOwnPublicKey());
    } else {
      encrypt.setPublicKey(getContactPublicKey(receiver));
    }
    return encrypt.encrypt(message);
  }

  function decrypt(message, key) {
    var encrypt = new JSEncrypt();
    if (key) {
      encrypt.setPrivateKey(key);
    } else {
      encrypt.setPrivateKey(getOwnPrivateKey());
    }
    return encrypt.decrypt(message);
  }

  /**
   * Checks user keys.
   * If parameters ommited, uses stored keys.
   *
   * @param privateKey
   * @param publicKey
   * @returns {boolean}
   */
  function checkOwnKeys(privateKey, publicKey) {
    return decrypt(encrypt("test", null, publicKey), privateKey) === "test";
  }

  return {
    saveOwnPrivateKey: saveOwnPrivateKey,
    getOwnPrivateKey: getOwnPrivateKey,
    saveOwnPublicKey: saveOwnPublicKey,
    getOwnPublicKey: getOwnPublicKey,
    saveContactPublicKey: saveContactPublicKey,
    getContactPublicKey: getContactPublicKey,
    encrypt: encrypt,
    decrypt: decrypt,
    checkOwnKeys: checkOwnKeys
  };
})();