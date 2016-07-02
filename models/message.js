var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Message', new Schema({
  messageText: String,
  dateCreated: Date,
  sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  reciever: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}));