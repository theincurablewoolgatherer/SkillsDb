var express = require('express');
var passport = require('passport');
var Project = require(__dirname+'/../models/project');
var app = express.Router();


//========================================================
// I. Controller actions
//========================================================
// Create Project
createProject = function(req, res) {
    var project = new Project(req.body);
    project.user = req.user;
    
    console.log(" POST ME: "+project);
    // save project
    return project.save(function(err){
        if(!err){
           res.statusCode = 200;
           return res.send({status: 'OK'});
        }else{
           res.statusCode = 500;
           return res.send({error : 'Server Error'});
        }
    });
}

//========================================================
// II. Controller URL to Action mapping
//========================================================
app.post('/', createProject);

module.exports = app;


