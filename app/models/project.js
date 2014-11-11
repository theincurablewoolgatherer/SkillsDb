var mongoose = require("mongoose");

var ProjectSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    projectname: String,
    company: String,
    industry: String,
    startdate: Date,
    enddate: Date,
    skills: [{
        skill : String
     }],
    technologies: [{
        technology : String
     }],
    tags: [{
        tag : String
     }]
});

module.exports = mongoose.model('Project', ProjectSchema);
