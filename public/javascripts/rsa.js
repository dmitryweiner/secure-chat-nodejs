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

  function encrypt(message, receiver) {
    var encrypt = new JSEncrypt();
    if (!receiver) {
      encrypt.setPublicKey(getOwnPublicKey());
    } else {
      encrypt.setPublicKey(getContactPublicKey(receiver));
    }
    return encrypt.encrypt(message);
  }

  function decrypt(message) {
    var encrypt = new JSEncrypt();
    encrypt.setPrivateKey(getOwnPrivateKey());
    return encrypt.decrypt(message);
  }

  return {
    saveOwnPrivateKey: saveOwnPrivateKey,
    getOwnPrivateKey: getOwnPrivateKey,
    saveOwnPublicKey: saveOwnPublicKey,
    getOwnPublicKey: getOwnPublicKey,
    saveContactPublicKey: saveContactPublicKey,
    getContactPublicKey: getContactPublicKey,
    encrypt: encrypt,
    decrypt: decrypt
  };
})();