var mongoose = require('mongoose'),
Schema = mongoose.Schema,
plm = require('passport-local-mongoose');

var User = new Schema({
  username: String,
  password: String
});

User.plugin(plm);

module.exports = mongoose.model('User', User);
