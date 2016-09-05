var SecureChat = SecureChat || {};

SecureChat.API = (function () {

  var apiUrl = window.location.href + 
    ((window.location.href.slice(-1) === "/") ? "" : "/") +
    "api";

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
    $.ajax({
      url: apiUrl + "/authenticate",
      method: "POST",
      data: {
        username: username,
        password: password
      },
      success: function(data) {
        callback(data);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        callback(null);
      }
    });
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
      url: apiUrl + "/contacts",
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

  function deleteContact(username, callback) {
    var token = SecureChat.Auth.getToken();
    if (!token) {
      callback(null);
    }

    if (!username) {
      callback(null);
    }

    $.ajax({
      url: apiUrl + "/contacts/" + encodeURIComponent(username),
      method: "DELETE",
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

  function approveRequest(username, callback) {
    var token = SecureChat.Auth.getToken();
    if (!token) {
      callback(null);
    }

    if (!username) {
      callback(null);
    }

    $.ajax({
      url: apiUrl + "/requests",
      method: "POST",
      data: {
        username: username
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

  function deleteRequest(username, callback) {
    var token = SecureChat.Auth.getToken();
    if (!token) {
      callback(null);
    }

    if (!username) {
      callback(null);
    }

    $.ajax({
      url: apiUrl + "/requests/" + encodeURIComponent(username),
      method: "DELETE",
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


  function getMessages(receiver, newest, callback) {
    var token = SecureChat.Auth.getToken();
    if (!token) {
      callback(null);
    }

    $.ajax({
      url: apiUrl +
           "/messages/" +
           encodeURIComponent(receiver) +
           "/" +
           (newest ? newest.toJSON() : "") +
           "?currentTime=" + new Date().getTime(),
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
      url: apiUrl + "/messages",
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
    deleteContact: deleteContact,
    approveRequest: approveRequest,
    deleteRequest: deleteRequest,
    getMessages: getMessages,
    addMessage: addMessage
  };
})();
