var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var User   = require('../../models/user');
var Message   = require('../../models/message');

router.get('/:receiver/:newest?', function(req, res) {
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

    var newest = null;
    if (typeof req.params.newest !== 'undefined') {
      newest = new Date(req.params.newest);
    }

    getMessages(req.authUser, receiver, newest, function(messages) {
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


router.post('/', function(req, res) {
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
      key: req.body.key,
      keyEncryptedBySender: req.body.keyEncryptedBySender,
      sender: mongoose.Types.ObjectId(req.authUser._id),
      receiver: mongoose.Types.ObjectId(receiver._id),
      isEncrypted: req.body.isEncrypted
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

      getMessages(req.authUser, receiver, null, function(messages) {
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

function getMessages(sender, receiver, newest, callback) {
  var request = newest ? {
    $and: [
      { $or: [
        {"sender":  mongoose.Types.ObjectId(sender._id)},
        {"receiver": mongoose.Types.ObjectId(sender._id)}] },
      { $or: [
        {"sender":  mongoose.Types.ObjectId(receiver._id)},
        {"receiver": mongoose.Types.ObjectId(receiver._id)}] },
      { dateCreated: { $gt: newest } }
    ]
  } : {
    $and: [
      { $or: [
        {"sender":  mongoose.Types.ObjectId(sender._id)},
        {"receiver": mongoose.Types.ObjectId(sender._id)}] },
      { $or: [
        {"sender":  mongoose.Types.ObjectId(receiver._id)},
        {"receiver": mongoose.Types.ObjectId(receiver._id)}] }
    ]
  };

  Message.find(request,
    null,
    {sort: {"dateCreated": 1}}
  ).limit(20).exec(
    function(err, messages) {
      if (err) {
        console.log("error", err.message);
        callback(null);
      }
      var filteredMessages = messages.map(function(message) {
        return {
          messageText: message.messageText,
          dateCreated: message.dateCreated,
          key: message.key,
          keyEncryptedBySender: message.keyEncryptedBySender,
          isOwn: String(message.sender) === String(sender._id),
          isEncrypted: message.isEncrypted
        };
      });
      callback(filteredMessages);
  });
}


module.exports = router;