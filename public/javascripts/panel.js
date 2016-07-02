var SecureChat = SecureChat || {};

SecureChat.Panel = (function () {

  var PanelStates = {
    NOT_LOGGED : 0,
    LOGGED     : 1
  };

  var panelState = null;

  function init() {

    panelState = SecureChat.Auth.isLogged() ? PanelStates.LOGGED : PanelStates.NOT_LOGGED;
    redrawPanel();

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
          panelState = PanelStates.LOGGED;
          redrawPanel();
          showContactsTab();
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
          showContacts(data.contacts);
        } else {
          $alert.removeClass("hidden").find("span.alert-text").text(data.message);
        }
      });
      return false;
    });

    $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
      if ('#contacts' === $(e.target).attr('href')) {
        loadAndShowContacts();
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

  }

  function redrawPanel() {
    if (panelState == PanelStates.LOGGED) {
      //show username
      var currentUser = SecureChat.Auth.getCurrenUser();
      $("span.user-name").text(currentUser.username);
      //show logout link
      $('a#loginLink').text("Logout");
      showContactsTab();
    } else {
      $("span.user-name").text("");
      //show login link
      $('a#loginLink').text("Login");
      showLoginTab();
    }
  }

  function showLoginTab() {
    $('#mainTabs a[href="#login"]').tab('show');
  }

  function showContactsTab() {
    $('#mainTabs a[href="#contacts"]').tab('show');
    loadAndShowContacts();
  }

  function loadAndShowContacts() {
    SecureChat.API.getContacts(function(data) {
      showContacts(data.contacts);
    });
  }

  function showContacts(contacts) {
    $("#contactList li").remove();
    contacts.forEach(function(contact) {
      $("#contactList").append("<li class='list-group-item'>" + contact.username +"</li>");
    });
  }

  return {
    init: init
  };
})();