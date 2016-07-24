var SecureChat = SecureChat || {};

SecureChat.API = (function () {

  var apiUrl = "api";

  function register(username, password, callback) {
    $.post(
      apiUrl + "/register",
      {
        username: username,
        password: password
      },
      function(data) {
        callback(data);
      }
    );
  }

  function authenticate(username, password, callback) {
    $.post(
      apiUrl + "/authenticate",
      {
        username: username,
        password: password
      },
      function(data) {
        callback(data);
      }
    );
  }

  function getContacts(callback) {
    var token = SecureChat.Auth.getToken();
    if (!token) {
      callback(null);
    }

    $.ajax({
      url: apiUrl + "/contacts",
      method: "GET",
      headers: {
        'x-access-token': token
      },
      success: function(data) {
        callback(data);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        callback(null);
      }
    });
  }

  function addContact(userToAdd, callback) {
    var token = SecureChat.Auth.getToken();
    if (!token) {
      callback(null);
    }

    $.ajax({
      url: apiUrl + "/contacts/add",
      method: "POST",
      data: {
        userToAdd: userToAdd
      },
      headers: {
        'x-access-token': token
      },
      success: function(data) {
        callback(data);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        callback(null);
      }
    });
  }

  function getMessages(receiver, callback) {
    var token = SecureChat.Auth.getToken();
    if (!token) {
      callback(null);
    }

    $.ajax({
      url: apiUrl + "/messages/" + encodeURIComponent(receiver),
      method: "GET",
      headers: {
        'x-access-token': token
      },
      success: function(data) {
        callback(data);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        callback(null);
      }
    });
  }

  function addMessage(receiver, messageText, key, keyEncryptedBySender, isEncrypted, callback) {
    var token = SecureChat.Auth.getToken();
    if (!token) {
      callback(null);
    }

    $.ajax({
      url: apiUrl + "/messages/add",
      method: "POST",
      data: {
        receiver: receiver,
        messageText: messageText,
        key: key,
        keyEncryptedBySender: keyEncryptedBySender,
        isEncrypted: isEncrypted
      },
      headers: {
        'x-access-token': token
      },
      success: function(data) {
        callback(data);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        callback(null);
      }
    });
  }

  return {
    register: register,
    authenticate: authenticate,
    getContacts: getContacts,
    addContact: addContact,
    getMessages: getMessages,
    addMessage: addMessage
  };
})();