var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var User   = require('../../models/user');

router.get('/', function(req, res) {
  User.findOne({"username": req.authUser.username}, function(err, user) { // TODO: may be we should search by Object ID
    var contacts;
    if (user) {
      User.populate(user, {
        path: 'contacts',
        model: 'User'
      }, function (err, user) {
        var contacts = user.contacts.map(function(contact) {
          return {
            username: contact.username
          };
        });
        res.json({
          success: true,
          contacts: contacts
        });
      });
      return;
    }
    res.json({
      success: false,
      message: "No user found",
      contacts: []
    });
  });
});

router.post('/add', function(req, res) {
  Promise.all([
    User.findOne({username: req.body.userToAdd}),
    User.findOne({username: req.authUser.username})
  ]).then(function(results) {
    var userToAdd = results[0];
    var currentUser = results[1];
    if (!userToAdd) {
      res.json({
        success: false,
        message: "User not found",
        contacts: []
      });
      return;
    }

    currentUser.contacts.push(userToAdd);

    currentUser.save(function (err) {
      if (err) {
        res.json({
          success: false,
          message: err.message,
          contacts: []
        });
        return;
      }

      User.populate(currentUser, {
        path: 'contacts',
        model: 'User'
      }, function (err, user) {
        var contacts = user.contacts.map(function(contact) {
          return {
            username: contact.username
          };
        });
        res.json({
          success: true,
          message: "User saved successfully",
          contacts: contacts
        });
      });

    });


  });
});

module.exports = router;