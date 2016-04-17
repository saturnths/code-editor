var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var Document = new Schema({
  title: String,
  date: Date,
  owner: String,
  collaborators: [String]
});

module.exports = mongoose.model('Document', Document);
