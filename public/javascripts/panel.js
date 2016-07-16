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
      $alert.addClass("hidden").find("span.alert-text").text("");
      if (!$username.val() || !$password.val() || !$passwordReenter.val()) {
        $alert.removeClass("hidden").addClass("alert-warning").find("span.alert-text").text("All fields are required");
        return false;
      }
      if ($password.val() !== $passwordReenter.val()) {
        $alert.removeClass("hidden").addClass("alert-warning").find("span.alert-text").text("Passwords should be equal");
        return false;
      }

      SecureChat.API.register($username.val(), $password.val(), function(data) {
        if(data.success) {
          $alert.removeClass("hidden").addClass("alert-success").find("span.alert-text").text("User successfully created");
          setTimeout(function() {
            $alert.addClass("hidden");
            showLoginTab();
          }, 1000);
          $username.val("");
          $password.val("");
        } else {
          $alert.removeClass("hidden").addClass("alert-warning").find("span.alert-text").text(data.message);
        }
      });
      return false;
    });

    $("#loginForm").on("submit", function() {
      var $username = $("#username");
      var $password = $("#password");
      var $alert = $("#loginForm .alert");
      $alert.addClass("hidden").find("span.alert-text").text("");
      if (!$username.val() || !$password.val()) {
        $alert.removeClass("hidden").addClass("alert-warning").find("span.alert-text").text("All fields are required");
        return false;
      }
      SecureChat.Auth.doAuthenticate($username.val(), $password.val(), function(data) {
        if(data.success) {
          $alert.removeClass("hidden").addClass("alert-success").find("span.alert-text").text("User successfully authenticated");
          setTimeout(function() {
            $alert.addClass("hidden");
            redrawPanel();
          }, 1000);
          $username.val("");
          $password.val("");
          panelState = PanelStates.LOGGED;
        } else {
          $alert.removeClass("hidden").addClass("alert-warning").find("span.alert-text").text(data.message);
        }
      });
      return false;
    });

    $("#addContactForm").on("submit", function() {
      var $contact = $("#addUsername");
      var $alert = $("#contacts .alert");
      $alert.addClass("hidden").find("span.alert-text").text("");
      if (!$contact.val()) {
        $alert.removeClass("hidden").find("span.alert-text").text("Enter contact to add");
        return false;
      }
      SecureChat.API.addContact($contact.val(), function(data) {
        if(data.success) {
          $contact.val("");
          showContacts(data.contacts);
        } else {
          $alert.removeClass("hidden").find("span.alert-text").text(data.message);
        }
      });
      return false;
    });

    $("#addMessageForm").on("submit", function() {
      var $receiver = $("#receiver");
      var $message = $("#addMessage");
      var $alert = $("#messages .alert");
      $alert.addClass("hidden").find("span.alert-text").text("");
      if (!$message.val()) {
        return false;
      }
      SecureChat.API.addMessage($receiver.val(), $message.val(), function(data) {
        if(data.success) {
          $message.val("");
          showMessages(data.messages);
        } else {
          $alert.removeClass("hidden").find("span.alert-text").text(data.message);
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

    $('a#registerSwitch').on('click', function () {
      $('#registerForm').removeClass('hidden');
      $('#loginForm').addClass('hidden');
    });

    $('a#loginSwitch').on('click', function () {
      $('#loginForm').removeClass('hidden');
      $('#registerForm').addClass('hidden');
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
      if (data === null) {
        doLogout();
        return;
      }
      showContacts(data.contacts);
    });
  }

  function loadAndShowMessages() {
    var receiver = $("#receiver").val();
    if (!receiver) {
      return;
    }
    SecureChat.API.getMessages(receiver, function(data) {
      if (data === null) {
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
    $("#messageList li").remove();
    messages.forEach(function(message) {
      var style="";
      if (message.isOwn) {
        style = "background-color:#adadad;"
      }
      $("#messageList").append($("<li class='list-group-item' style='" + style + "'></li>").text(message.messageText));
    });
  }

  function doLogout() {
    panelState = PanelStates.NOT_LOGGED;
    SecureChat.Auth.doLogout();
    showLoginTab();
    redrawPanel();
  }

  return {
    init: init
  };
})();