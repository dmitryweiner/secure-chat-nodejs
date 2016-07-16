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
      var $alert = $("#messages .alert");
      hideAlert($alert);
      if (!$message.val()) {
        return false;
      }
      SecureChat.API.addMessage($receiver.val(), $message.val(), function(data) {
        if(data.success) {
          $message.val("");
          showMessages(data.messages);
        } else {
          showAlert($alert, "warning", data.message);
        }
      });
      return false;
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      isShowingMessages = false;
      if ('#contacts' === $(e.target).attr('href')) {
        loadAndShowContacts();
      }
      if ('#messages' === $(e.target).attr('href')) {
        loadAndShowMessages();
        isShowingMessages = true;
      }
    });

    $('a#loginLink').on('click', function () {
      if (panelState == PanelStates.LOGGED) {
        SecureChat.Auth.doLogout();
        panelState = PanelStates.NOT_LOGGED;
      } else {
        showLoginTab();
      }
      redrawPanel();
    });

    $(document.body).on('click', '#contactList li', function() {
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
      $("span.user-name").text(currentUser.username);
      $("a#loginLink").text("Logout");
      $("#currentUser").show().find("span").text(currentUser.username);
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
      $("span.user-name").text("");
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
    $("#mainTabs a[href='#login']").tab("show");
  }

  function showContactsTab() {
    $("#mainTabs a[href='#contacts']").tab("show");
  }

  function showMessagesTab() {
    $("#mainTabs a[href='#messages']").tab("show");
  }

  function loadAndShowContacts() {
    SecureChat.API.getContacts(function(data) {
      showContacts(data.contacts);
    });
  }

  function loadAndShowMessages() {
    var receiver = $("#receiver").val();
    if (!receiver) {
      return;
    }
    SecureChat.API.getMessages(receiver, function(data) {
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
    $("#messageList li").remove();
    messages.forEach(function(message) {
      var style="";
      if (message.isOwn) {
        style = "background-color:#adadad;"
      }
      $("#messageList").append($("<li class='list-group-item' style='" + style + "'></li>").text(message.messageText));
    });
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