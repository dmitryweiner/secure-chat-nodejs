var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var User   = require('../../models/user');
var Message   = require('../../models/message');

router.get('/:receiver', function(req, res) {
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


router.post('/add', function(req, res) {
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