var SecureChat = SecureChat || {};

/*

 http://stackoverflow.com/questions/27179685/how-to-encrypt-a-message-at-client-side-using-crypto-js-library-and-decrypt-it-a

 function  generateKey(){
 var salt = CryptoJS.lib.WordArray.random(128/8);
 var iv = CryptoJS.lib.WordArray.random(128/8);
 console.log('salt  '+ salt );
 console.log('iv  '+ iv );
 var key128Bits100Iterations = CryptoJS.PBKDF2("Secret Passphrase", salt, { keySize: 128/32, iterations: 100 });
 console.log( 'key128Bits100Iterations '+ key128Bits100Iterations);
 var encrypted = CryptoJS.AES.encrypt("Message", key128Bits100Iterations, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7  });
 }

 function  decrypt(){
 var salt = CryptoJS.enc.Hex.parse("4acfedc7dc72a9003a0dd721d7642bde");
 var iv = CryptoJS.enc.Hex.parse("69135769514102d0eded589ff874cacd");
 var encrypted = "PU7jfTmkyvD71ZtISKFcUQ==";
 var key = CryptoJS.PBKDF2("Secret Passphrase", salt, { keySize: 128/32, iterations: 100 });
 console.log( 'key '+ key);
 var decrypt = CryptoJS.AES.decrypt(encrypted, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
 var ddd = decrypt.toString(CryptoJS.enc.Utf8);
 console.log('ddd '+ddd);
 }
 */

SecureChat.AES = (function () {

  function encrypt(message) {
    var key = CryptoJS.lib.WordArray.random(128/8);
    var encrypted = CryptoJS.AES.encrypt(
      message,
      key,
      {
        iv: key, //NOTE: this is bad thing, we should generate initialization vector separately
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    return [encrypted.toString(), key.toString()];
  }

  function decrypt(message, key) {
    var keyParsed = CryptoJS.enc.Hex.parse(key);
    var decrypt = CryptoJS.AES.decrypt(
      message,
      keyParsed,
      {
        iv: keyParsed,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    return decrypt.toString(CryptoJS.enc.Utf8);
  }

  return {
    encrypt: encrypt,
    decrypt: decrypt
  };
})();
