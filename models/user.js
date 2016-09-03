// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('User', new Schema({
  username: {type: String, unique: true },
  password: String,
  salt: String,
  isAdmin: Boolean,
  contacts: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  requests: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
}));