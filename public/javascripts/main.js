"use strict";

$(function() {

  var apiUrl = "api";
  var token;

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
    $.post(
      apiUrl + "/register",
      {
        username: $username.val(),
        password: $password.val()
      },
      function(data) {
        if(data.success) {
          $alert.removeClass("hidden").addClass("alert-success").find("span.alert-text").text("User successfully created");
        } else {
          $alert.removeClass("hidden").addClass("alert-warning").find("span.alert-text").text(data.message);
        }
      }
    );
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
    $.post(
      apiUrl + "/authenticate",
      {
        username: $username.val(),
        password: $password.val()
      },
      function(data) {
        if(data.success) {
          token = data.token;
          $alert.removeClass("hidden").addClass("alert-success").find("span.alert-text").text("User successfully authenticated");
        } else {
          $alert.removeClass("hidden").addClass("alert-warning").find("span.alert-text").text(data.message);
        }
      }
    );
    return false;
  });


});