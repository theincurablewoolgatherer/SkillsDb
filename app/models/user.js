var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    firstname: String,
    lastname: String,
    department: String,
    rank: String,
    position: String
});

module.exports = mongoose.model('User', UserSchema);
