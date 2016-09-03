var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var User   = require('../../models/user');

router.delete('/:username', function(req, res, next) {
  Promise.all([
    User.findOne({username: req.params.username}),
    User.findOne({username: req.authUser.username})
  ]).then(function(results) {
    var userToDelete = results[0];
    var currentUser = results[1];
    User.populate(currentUser, {
      path: 'requests',
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

        currentUser.requests = currentUser.requests.filter(function(user) {
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
            message: "Request deleted successfully"
          });
        });
      }
    });

  });
});

router.post('/', function(req, res, next) {
  Promise.all([
    User.findOne({username: req.body.username}),
    new Promise(function(resolve, reject) {
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
        .exec(function(err, user) {
          if (err) {
            reject(err);
          }
          resolve(user);
        })
    })
  ]).then(function(results) {
    var userToAdd = results[0];
    var currentUser = results[1];
    if (!userToAdd) {
      res.json({
        success: false,
        message: "User not found"
      });
      return;
    }

    currentUser.contacts.push(userToAdd);
    currentUser.requests = currentUser.requests.filter(function(user) {
      return String(userToAdd._id) !== String(user._id);
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
        message: "Contact added successfully"
      });
    });
  });
});

module.exports = router;