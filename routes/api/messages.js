var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var User   = require('../../models/user');
var Message   = require('../../models/message');

router.get('/:receiver', function(req, res) {
  User.findOne({"username": req.params.receiver}, function(err, receiver) {
    if (err) {
      console.log("error", err.message);
      res.json({
        success: false,
        message: err.message,
        messages: []
      });
      return;
    }

    if (!receiver) {
      res.json({
        success: false,
        message: "User not found",
        messages: []
      });
      return;
    }

    getMessages(req.authUser, receiver, function(messages) {
      if (messages === null) {
        res.json({
          success: false,
          messages: []
        });
        return;
      }
      res.json({
        success: true,
        messages: messages
      });
    });
  });
});


router.post('/add', function(req, res) {
  User.findOne({username: req.body.receiver}, function(err, receiver) {
    if (err) {
      console.log("error", err.message);
      res.json({
        success: false,
        message: err.message,
        messages: []
      });
      return;
    }

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
      sender: mongoose.Types.ObjectId(req.authUser._id),
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

      getMessages(req.authUser, receiver, function(messages) {
        if (messages === null) {
          res.json({
            success: false,
            messages: []
          });
          return;
        }
        res.json({
          success: true,
          messages: messages
        });
      });
    });
  });

});

function getMessages(sender, receiver, callback) {
  Message.find({
      $and: [
        { $or: [
          {"sender":  mongoose.Types.ObjectId(sender._id)},
          {"receiver": mongoose.Types.ObjectId(sender._id)}] },
        { $or: [
          {"sender":  mongoose.Types.ObjectId(receiver._id)},
          {"receiver": mongoose.Types.ObjectId(receiver._id)}] }
      ]
    },
    null,
    {sort: {"dateCreated": -1}}
  ).limit(20).exec(
    function(err, messages) {
      if (err) {
        console.log("error", err.message);
        callback(null);
      }
      var filteredMessages = messages.map(function(message) {
        return {
          messageText: message.messageText,
          isOwn: String(message.sender) === String(sender._id)
        };
      });
      callback(filteredMessages);
  });
}


module.exports = router;