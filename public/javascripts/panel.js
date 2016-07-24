var SecureChat = SecureChat || {};

SecureChat.Panel = (function () {

  var PanelStates = {
    NOT_LOGGED : 0,
    LOGGED     : 1
  };

  var panelState = null;

  var isShowingMessages = false;

  function init() {

    $("#registerForm").on("submit", function() {
      var $username = $("#registerFormUsername");
      var $password = $("#registerFormPassword");
      var $passwordReenter = $("#registerFormPasswordReenter");
      var $alert = $("#registerForm .alert");
      hideAlert($alert);
      if (!$username.val() || !$password.val() || !$passwordReenter.val()) {
        showAlert($alert, "warning", "All fields are required");
        return false;
      }
      if ($password.val() !== $passwordReenter.val()) {
        showAlert($alert, "warning", "Passwords should be equal");
        return false;
      }

      SecureChat.API.register($username.val(), $password.val(), function(data) {
        if(data.success) {
          showAlert($alert, "success", "User successfully created");
          setTimeout(function() {
            hideAlert($alert);
            showLoginTab();
          }, 1000);
          $username.val("");
          $password.val("");
          $passwordReenter.val("");
        } else {
          showAlert($alert, "warning", data.message);
        }
      });
      return false;
    });

    $("#loginForm").on("submit", function() {
      var $username = $("#username");
      var $password = $("#password");
      var $alert = $("#loginForm .alert");
      hideAlert($alert);
      if (!$username.val() || !$password.val()) {
        showAlert($alert, "warning", "All fields are required");
        return false;
      }
      SecureChat.Auth.doAuthenticate($username.val(), $password.val(), function(data) {
        if(data.success) {
          showAlert($alert, "success", "User successfully authenticated");
          setTimeout(function() {
            hideAlert($alert);
            redrawPanel();
          }, 1000);
          $username.val("");
          $password.val("");
          panelState = PanelStates.LOGGED;
        } else {
          showAlert($alert, "warning", data.message);
        }
      });
      return false;
    });

    $("#addContactForm").on("submit", function() {
      var $contact = $("#addUsername");
      var $alert = $("#contacts .alert");
      hideAlert($alert);
      if (!$contact.val()) {
        showAlert($alert, "warning", "Enter contact to add");
        return false;
      }
      SecureChat.API.addContact($contact.val(), function(data) {
        if(data.success) {
          $contact.val("");
          showContacts(data.contacts);
        } else {
          showAlert($alert, "warning", data.message);
        }
      });
      return false;
    });

    $("#addMessageForm").on("submit", function() {
      var $receiver = $("#receiver");
      var $message = $("#addMessage");
      var $isEncrypted = $("#isEncrypted");
      var $alert = $("#messages .alert");
      hideAlert($alert);
      if (!$message.val()) {
        return false;
      }

      var message = $message.val();
      var key = "";
      var keyEncryptedBySender = "";
      if ($isEncrypted.is(":checked")) {
        var encryptedMessageAndKey = SecureChat.AES.encrypt(message);
        message = encryptedMessageAndKey[0];
        key = SecureChat.RSA.encrypt(encryptedMessageAndKey[1], $receiver.val());
        keyEncryptedBySender = SecureChat.RSA.encrypt(encryptedMessageAndKey[1]);
      }

      SecureChat.API.addMessage($receiver.val(), message, key, keyEncryptedBySender, $isEncrypted.is(":checked"), function(data) {
        if(data.success) {
          $message.val("");
          showMessages(data.messages);
        } else {
          showAlert($alert, "warning", data.message);
        }
      });
      return false;
    });
    
    $("#ownKeysForm").on("submit", function() {
      var $alert = $(".own-keys .alert");
      SecureChat.RSA.saveOwnPublicKey($("#ownPublicKey").val());
      SecureChat.RSA.saveOwnPrivateKey($("#ownPrivateKey").val());
      showAlert($alert, "success", "Successfully saved");
      setTimeout(function() {
        hideAlert($alert);
      }, 1000);
      return false;
    });

    $("#publicKeyForm").on("submit", function() {
      var $alert = $(".public-key .alert");
      var receiver = $("#receiver").val();
      if (receiver) {
        SecureChat.RSA.saveContactPublicKey(receiver, $("#publicKey").val());
        showAlert($alert, "success", "Successfully saved");
        setTimeout(function() {
          hideAlert($alert);
        }, 1000);
      }
      return false;
    });

    $("a[data-toggle='tab']").on("shown.bs.tab", function (e) {
      isShowingMessages = false;
      if ("#profile" === $(e.target).attr("href")) {
        $("#ownPrivateKey").val(SecureChat.RSA.getOwnPrivateKey());
        $("#ownPublicKey").val(SecureChat.RSA.getOwnPublicKey());
      }
      if ("#contacts" === $(e.target).attr("href")) {
        loadAndShowContacts();
      }
      if ("#messages" === $(e.target).attr("href")) {
        loadAndShowMessages();
        showPublicKey();
        isShowingMessages = true;
      }
    });

    $("a#loginLink").on("click", function () {
      if (panelState == PanelStates.LOGGED) {
        SecureChat.Auth.doLogout();
        panelState = PanelStates.NOT_LOGGED;
      } else {
        showLoginTab();
      }
      redrawPanel();
    });

    $("a#registerSwitch").on("click", function () {
      $("#registerForm").removeClass("hidden");
      $("#loginForm").addClass("hidden");
    });

    $("a#loginSwitch").on("click", function () {
      $("#loginForm").removeClass("hidden");
      $("#registerForm").addClass("hidden");
    });

    $(document.body).on("click", "#contactList li", function() {
      var username = $(this).data("username");
      $("#receiver").val(username);
      $("span#receiverName").text(username);
      showMessagesTab();
    });

    $("#addMessage").keypress(function(event) {
      if (event.which == 13) {
        event.preventDefault();
        $("#addMessageForm").submit();
      }
    });

    panelState = SecureChat.Auth.isLogged() ? PanelStates.LOGGED : PanelStates.NOT_LOGGED;
    redrawPanel();

  }

  function redrawPanel() {
    if (panelState == PanelStates.LOGGED) {
      //show username
      var currentUser = SecureChat.Auth.getCurrenUser();
      $("strong.user-name").text(currentUser.username);
      $("a#loginLink").text("Logout");
      $("#currentUser").show().find("strong").text(currentUser.username);
      $("#loginRegisterForms").hide();

      // Clean fields on "Messages" tab
      $("#receiver").val("");
      $("span#receiverName").text("");
      $("#messageList li").remove();
      $("#addMessage").val("");

      //show tabs
      $("a[href='#contacts']").parent().show();
      $("a[href='#messages']").parent().show();

      showContactsTab();
    } else {
      $("strong.user-name").text("");
      $("a#loginLink").text("Login");
      $("#currentUser").hide();
      $("#loginRegisterForms").show();

      //hide tabs
      $("a[href='#contacts']").parent().hide();
      $("a[href='#messages']").parent().hide();

      showLoginTab();
    }
  }

  function showLoginTab() {
    $("#mainTabs a[href='#profile']").tab("show");
  }

  function showContactsTab() {
    $("#mainTabs a[href='#contacts']").tab("show");
  }

  function showMessagesTab() {
    $("#mainTabs a[href='#messages']").tab("show");
  }

  function loadAndShowContacts() {
    SecureChat.API.getContacts(function(data) {
      if (data === null || !data.success) {
        doLogout();
        return;
      }
      showContacts(data.contacts);
    });
  }

  function showPublicKey() {
    var receiver = $("#receiver").val();
    if (!receiver) {
      return;
    }
    $("#publicKey").val(SecureChat.RSA.getContactPublicKey(receiver));
  }

  function loadAndShowMessages() {
    var receiver = $("#receiver").val();
    if (!receiver) {
      return;
    }
    SecureChat.API.getMessages(receiver, function(data) {
      if (data === null || !data.success) {
        doLogout();
        return;
      }
      showMessages(data.messages);
      if (isShowingMessages) {
        setTimeout(loadAndShowMessages, 2000);
      }
    });
  }

  function showContacts(contacts) {
    $("#contactList li").remove();
    contacts.forEach(function(contact) {
      //TODO: escape username
      $("#contactList").append($("<li class='list-group-item' data-username='" + contact.username + "'></li>").text(contact.username));
    });
  }

  function showMessages(messages) {
    // TODO: here should be more intellectual message adding
    var receiver = $("#receiver").val();
    $("#messageList li").remove();
    messages.forEach(function(message) {
      var style = "";
      var messageText;
      var key = "";
      if (message.isOwn) {
        style = "background-color:#adadad;"
      }
      messageText = message.messageText;

      if(message.isEncrypted) {
        if (message.isOwn) {
          key = SecureChat.RSA.decrypt(message.keyEncryptedBySender);
          messageText = SecureChat.AES.decrypt(message.messageText, key);
          style = "background-color:#3399ff;"
        } else {
          key = SecureChat.RSA.decrypt(message.key);
          messageText = SecureChat.AES.decrypt(message.messageText, key);
          style = "background-color:#e6f2ff;"
        }
        if (!messageText) {
          messageText = "DECODING FAILED";
        }
      }

      $("#messageList").append($("<li class='list-group-item' style='" + style + "'></li>").text(messageText));
    });
  }

  function doLogout() {
    panelState = PanelStates.NOT_LOGGED;
    SecureChat.Auth.doLogout();
    showLoginTab();
    redrawPanel();
  }

  /**
   * shows message when user
   * @target: HTMLDivElement  // dom element hosting the message
   * @type: string            // part of the class, now either 'warning' or 'success'
   * @message: string         // message to be displayed
   */
  function showAlert (target, type, message) {
    target
      .attr("class", "alert fade in alert-" + type)
      .find("span.alert-text")
      .text(message)
      ;
  }

  /**
   * hide alert and clean the message
   * @target: HTMLDivElement  // dom element hosting the message
   */
  function hideAlert (target) {
    target
      .attr("class", "alert fade in hidden")
      .find("span.alert-text")
      .text("")
      ;
  }

  return {
    init: init
  };
})();