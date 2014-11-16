/**
*   Contains routes for the API
*
*/
var express = require('express');
var passport = require('passport');
var Project = require(__dirname+'/../models/project');
var User = require(__dirname+'/../models/user');
var mongoose = require("mongoose");
var app = express.Router();


//========================================================
// I. Controller actions
//========================================================
// Create Profile
createProfile = function(req, res) {
    //TODO
}

// Retrieve single Profile
getProfile = function(req, res) {
  User.findOne({username: req.params.username}, function(err, profile){
    if(!profile){
      res.statusCode = 404;
      return res.send({error: 'Not found'});
    }

    if(!err){
      return res.send({status: 'OK', user:profile});
    }else{
      res.statusCode = 500;
      return res.send({error : 'Server Error'});
    }

  });
}

// Update Profile
updateProfile = function(req, res) {
        // Update fields
        if(req.body.firstname != null) req.user.firstname = req.body.firstname;
        if(req.body.lastname != null) req.user.lastname = req.body.lastname;
        if(req.body.department != null) req.user.department = req.body.department;
        if(req.body.rank != null) req.user.rank = req.body.rank;
        if(req.body.position != null) req.user.position = req.body.position;
        
        // save profile
        return req.user.save(function(err){
          if(!err){
            res.statusCode = 200;
            return res.send({status: 'OK', user:req.user});
          }else{
            res.statusCode = 500;
            return res.send({error : 'Server Error'});
          }
        });
      }

// Create Project
createProject = function(req, res) {
  var project = new Project(req.body);
  project.user = req.user;

  console.log(" POST ME: "+req.body);
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

// Retrieve Projects
getProjects = function(req, res) {
  User.findOne({username: req.params.username}, function(err, user){
    if(err){
      res.statusCode = 500;
      return res.send({error: err});
    }else{
      if(!user){
        res.statusCode = 500;
        return res.send({error : 'No such user'});
      }else{
        Project.find({user:  mongoose.Types.ObjectId(user._id)}, function(err, projects){
          if(err){
            res.statusCode = 500;
            return res.send({error: err});
          }else{
            res.statusCode = 200;
            return res.json(projects);
          }

        });
      }

    }
  });
}

// Retrieve Projects
getSkills = function(req, res) {
  skills = [];
  User.findOne({username: req.params.username}, function(err, user){
    if(err){
      res.statusCode = 500;
      return res.send({error: err});
    }else{
      if(!user){
        res.statusCode = 500;
        return res.send({error : 'No such user'});
      }else{
        Project.aggregate(
            [{ $match: {
                user:  mongoose.Types.ObjectId(user._id)
            }},
            { $unwind : "$skills" }, 
            { $group : { _id : "$skills.skill", project_count : { $sum : 1 } , project_days: {$sum: {$subtract: ["$enddate", "$startdate"]}}} },
            { $sort : { project_days : -1 } }
            
            
            ], function(err, projects){
          if(err){
            res.statusCode = 500;
            return res.send({error: err});
          }else{
            res.statusCode = 200;
            return res.json(projects);
          }

        });
      }

    }
  });
}
  

//========================================================
// II. Controller URL to Action mapping
//========================================================
app.get('/project/list/of/:username', getProjects);
app.post('/project', createProject);

app.get('/profile/:username', getProfile);
app.post('/profile', createProfile);
app.put('/profile', updateProfile);
app.get('/profile/skills/of/:username', getSkills);

module.exports = app;


