var express = require('express');
var router = express.Router();
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var crypto = require('crypto');
var mongoose = require('mongoose');

var User   = require('../../models/user');
var config = require('../../config');

var apiContacts = require('./contacts');
var apiMessages = require('./messages');
var apiRequests = require('./requests');


router.post('/authenticate', function(req, res, next) {

  // find the user
  User.findOne({
    username: req.body.username
  }).lean().exec(function(err, user) {

    if (err)
    {
      next(err);
    }
    else if (!user) {
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
          expiresIn: 1440 * 1000 // expires in 24 hours
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

router.post('/register', function(req, res, next) {

  //check if username already exists
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err)
    {
      next(err);
    }
    else if (user) {
      res.json({
        success: false,
        message: "User already exists"
      });
      return;
    }

    var salt = Math.random().toString(36).slice(-10);
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
      var token = jwt.sign(newUser.toObject(), config.secret, {
        expiresIn: 1440 * 1000
      });
      res.json({
        success: true,
        token: token,
        user: {
          username: newUser.username,
          isAdmin: newUser.isAdmin
        },
        message: "User successfully saved"
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
        console.log('jwt error', err.message);
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


router.use('/contacts', apiContacts);
router.use('/messages', apiMessages);
router.use('/requests', apiRequests);

module.exports = router;