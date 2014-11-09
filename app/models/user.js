var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    firstname: String,
    lastname: String,
    department: String,
    rank: String,
    position: String,
    project: [{
        name : String,
        company : String
     }]
});

module.exports = mongoose.model('User', UserSchema);
