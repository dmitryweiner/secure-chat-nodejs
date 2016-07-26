var SecureChat = SecureChat || {};

SecureChat.Auth = (function () {

  var tokenKey = "token";
  var userKey = "user";

  var currentUser;

  function isLogged() {
    return SecureChat.LocalStorage.load(tokenKey) ? true : false;
  }

  function getToken() {
    return SecureChat.LocalStorage.load(tokenKey);
  }

  function doAuthenticate(username, password, callback) {
    SecureChat.API.authenticate(username, password, function(data) {
      if (data.success) {
        SecureChat.LocalStorage.save(tokenKey, data.token);
        SecureChat.LocalStorage.save(userKey, JSON.stringify(data.user));
        currentUser = data.user;
      }
      callback(data);
    });
  }

  function doLogout() {
    SecureChat.LocalStorage.remove(tokenKey);
    SecureChat.LocalStorage.remove(userKey);
  }

  function getCurrenUser() {
    if (!isLogged()) {
      return null;
    }
    if (!currentUser) {
      currentUser = JSON.parse(SecureChat.LocalStorage.load(userKey));
    }
    return currentUser;
  }

  return {
    isLogged: isLogged,
    getToken: getToken,
    doAuthenticate: doAuthenticate,
    doLogout: doLogout,
    getCurrenUser: getCurrenUser
  };
})();