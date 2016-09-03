var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var User   = require('../../models/user');

router.get('/', function(req, res, next) {
  User
    .findOne({"username": req.authUser.username})
    .populate({
      path: 'contacts',
      model: 'User'
    })
    .populate({
      path: 'requests',
      model: 'User'
    })
    .exec(function (err, user) {
      if (err) {
        return res.json({
          success: false,
          message: err.message
        });
      }
      res.json({
        success: true,
        contacts: user.contacts.map(function(currentUser) {
          return {
            username: currentUser.username
          };
        }),
        requests: user.requests.map(function(currentUser) {
          return {
            username: currentUser.username
          };
        })
      });
    });
});

router.post('/', function(req, res, next) {
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
            message: "User not found"
          });
          return;
        }

        if (String(userToAdd._id) === String(currentUser._id)) {
          res.json({
            success: false,
            message: "You can not add yourself to contacts"
          });
          return;
        }

        currentUser.contacts.push(userToAdd);
        userToAdd.requests.push(currentUser);

        Promise.all([
          currentUser.save(),
          userToAdd.save()
        ]).then(function() {
          res.json({
            success: true,
            message: "Contact added successfully"
          });
        }).catch(function(err) {
          res.json({
            success: false,
            message: err.message
          });
        });
      }
    });

  });
});

router.delete('/:username', function(req, res, next) {
  Promise.all([
    User.findOne({username: req.params.username}),
    User.findOne({username: req.authUser.username})
  ]).then(function(results) {
    var userToDelete = results[0];
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
        if (!userToDelete) {
          res.json({
            success: false,
            message: "User not found"
          });
          return;
        }

        currentUser.contacts = currentUser.contacts.filter(function(user) {
          return String(userToDelete._id) !== String(user._id);
        });

        currentUser.save(function(err) {
          if (err) {
            return res.json({
              success: false,
              message: err.message
            });
          }
          res.json({
            success: true,
            message: "Contact deleted successfully"
          });
        });
      }
    });

  });
});

module.exports = router;