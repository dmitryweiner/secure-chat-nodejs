var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Chat', new Schema({
  dateCreated: Date,
  participants: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
}));