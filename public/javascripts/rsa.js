var SecureChat = SecureChat || {};

SecureChat.RSA = (function () {

  var privatePrefix = 'rsa_private';
  var publicPrefix  = 'rsa_public';

  function saveOwnPrivateKey(key) {
    SecureChat.LocalStorage.save(privatePrefix, key);
  }

  function getOwnPrivateKey() {
    return SecureChat.LocalStorage.load(privatePrefix);
  }

  function saveContactPublicKey(username, key) {
    SecureChat.LocalStorage.save(publicPrefix + '_' + username, key);
  }

  function getContactPublicKey(username) {
    return SecureChat.LocalStorage.load(publicPrefix + '_' + username);
  }

  function encrypt(message) {
    var encrypt = new JSEncrypt();
    encrypt.setPrivateKey(getOwnPrivateKey());
    return encrypt.encrypt(message);
  }

  function decrypt(username, message) {
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(getContactPublicKey(username));
    return encrypt.decrypt(message);
  }

  return {
    saveOwnPrivateKey: saveOwnPrivateKey,
    saveContactPublicKey: saveContactPublicKey,
    encrypt: encrypt,
    decrypt: decrypt
  };
})();