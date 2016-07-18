var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Message', new Schema({
  messageText: String,
  dateCreated: { type: Date, default: Date.now },
  sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  receiver: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  isEncrypted: Boolean
}));