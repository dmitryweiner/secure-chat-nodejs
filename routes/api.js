var express = require('express');
var router = express.Router();
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var crypto = require('crypto');
var mongoose = require('mongoose');

var User   = require('../models/user');
var Message   = require('../models/message');
var config = require('../config');

var app = express();

router.post('/authenticate', function(req, res) {

  // find the user
  User.findOne({
    username: req.body.username
  }).lean().exec(function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      var currentPassword = crypto.createHash('md5').update(req.body.password + user.salt).digest("hex");
      if (user.password !== currentPassword) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, config.secret, {
          expiresIn: 1440 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token,
          user: {
            username: user.username,
            isAdmin: user.isAdmin
          }
        });
      }

    }

  });
});

router.post('/register', function(req, res) {
  //check if username already exists
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (user) {
      res.json({
        success: false,
        message: "User already exists"
      });
      return;
    }

    var salt = Math.random().toString(36);
    var newUser = new User({
      username: req.body.username,
      password: crypto.createHash('md5').update(req.body.password + salt).digest("hex"),
      salt: salt,
      isAdmin: false
    });

    newUser.save(function (err) {
      if (err) {
        res.json({
          success: false,
          message: err.message
        });
        return;
      }
      res.json({
        success: true,
        message: "User saved successfully"
      });
    });
  });
});

// route middleware to verify a token
router.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.authUser = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });

  }
});

router.get('/contacts', function(req, res) {
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

router.post('/contacts/add', function(req, res) {
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

router.get('/messages/:receiver', function(req, res) {
  console.log("req.query.receiver", req.params.receiver);
  User.findOne({"username": req.params.receiver}, function(err, receiver) {
    if (!receiver) {
      res.json({
        success: false,
        message: "User not found",
        messages: []
      });
      return;
    }
    Message.find({
      $and: [
        { $or: [
          {"sender":  mongoose.Types.ObjectId(req.authUser._id)},
          {"receiver": mongoose.Types.ObjectId(req.authUser._id)}] },
        { $or: [
          {"sender":  mongoose.Types.ObjectId(receiver._id)},
          {"receiver": mongoose.Types.ObjectId(receiver._id)}] }
      ]
    },
    null,
    {sort: {"dateCreated": -1}})
    .limit(20).exec(
      function(err, messages) {
        var filteredMessages = messages.map(function(message) {
          return {
            messageText: message.messageText,
            isOwn: message.sender == req.authUser._id
          };
        });
        res.json({
          success: true,
          messages: filteredMessages
        });
    });
  });
});


router.post('/messages/add', function(req, res) {
  Promise.all([
    User.findOne({username: req.body.receiver}),
    User.findOne({username: req.authUser.username})
  ]).then(function(results) {
    var receiver = results[0];
    var currentUser = results[1];
    if (!receiver) {
      res.json({
        success: false,
        message: "User not found",
        contacts: []
      });
      return;
    }

    var newMessage = new Message({
      messageText: req.body.messageText,
      sender: mongoose.Types.ObjectId(currentUser._id),
      receiver: mongoose.Types.ObjectId(receiver._id)
    });

    newMessage.save(function (err) {
      if (err) {
        console.log("error", err.message);
        res.json({
          success: false,
          message: err.message,
          messages: []
        });
        return;
      }

      Message.find({
        $and: [
        { $or: [
          {"sender":  mongoose.Types.ObjectId(currentUser._id)},
          {"receiver": mongoose.Types.ObjectId(currentUser._id)}] },
        { $or: [
          {"sender":  mongoose.Types.ObjectId(receiver._id)},
          {"receiver": mongoose.Types.ObjectId(receiver._id)}] }
         ]},
        null,
        {sort: {"dateCreated": -1}})
        .limit(20).exec(
        function(err, messages) {
          if (err) {
            res.json({
              success: false,
              message: err.message,
              messages: []
            });
            return;
          }
          var filteredMessages = messages.map(function(message) {
            return {
              messageText: message.messageText,
              isOwn: message.sender == req.authUser._id
            };
          });
          res.json({
            success: true,
            messages: filteredMessages
          });
      });
    });


  });

});

module.exports = router;