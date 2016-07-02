var SecureChat = SecureChat || {};

SecureChat.LocalStorage = (function () {

  function save(name, value) {
    if (typeof(Storage) !== "undefined") {
      localStorage.setItem(name, value);
      return true;
    }
    return false;
  }

  function load(name) {
    if (typeof(Storage) !== "undefined") {
      return localStorage.getItem(name);
    }
    return false;
  }

  function remove(name) {
    if (typeof(Storage) !== "undefined") {
      return localStorage.removeItem(name);
    }
    return false;
  }

  return {
    save: save,
    load: load,
    remove: remove
  };
})();