var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var User   = require('../../models/user');

router.get('/', function(req, res, next) {
  User.findOne({"username": req.authUser.username}, function(err, user) { // TODO: may be we should search by Object ID
    var contacts;
    if (err) { next(next); }
    else if (user) {
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

router.post('/add', function(req, res, next) {
  Promise.all([
    User.findOne({username: req.body.userToAdd}),
    User.findOne({username: req.authUser.username})
  ]).then(function(results) {
    var userToAdd = results[0];
    var currentUser = results[1];
    User.populate(currentUser, {
      path: 'contacts',
      model: 'User'
    }, function (err, user) {
      if (err) { next(next); }
      else {
        var contacts = user.contacts.map(function(contact) {
          return {
            username: contact.username
          };
        });
        if (!userToAdd) {
          res.json({
            success: false,
            message: "User not found",
            contacts: contacts
          });
          return;
        }

        if (String(userToAdd._id) === String(currentUser._id)) {
          res.json({
            success: false,
            message: "You can not add yourself to contacts",
            contacts: contacts
          });
          return;
        }

        currentUser.contacts.push(userToAdd);
        contacts.push({
          username: userToAdd.username
        });

        currentUser.save(function (err) {
          if (err) {
            res.json({
              success: false,
              message: err.message,
              contacts: contacts
            });
            return;
          }
          res.json({
            success: true,
            message: "User saved successfully",
            contacts: contacts
          });
        });
      }
    });

  });
});

module.exports = router;