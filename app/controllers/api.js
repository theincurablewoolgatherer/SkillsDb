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
      return res.send({status: 'OK', profile:profile});
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
       User.findOne({username: req.user.username}, function(err, user){
          if(user)
            user.project.push(project);
            user.save(function(err){
          if(err){
            res.statusCode = 500;
            return res.send({error : 'Server Error'});
          }
        });
       });

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
// Update Project
updateProject = function(req, res) {
    var updateData = {};
    if(req.body.user != null) updateData.user = req.body.user;
    if(req.body.projectname != null) updateData.projectname = req.body.projectname;
    if(req.body.company != null) updateData.company = req.body.company;
    if(req.body.industry != null) updateData.industry = req.body.industry;
    if(req.body.startdate != null) updateData.startdate = req.body.startdate;
    if(req.body.enddate != null) updateData.enddate = req.body.enddate;
    if(req.body.skills != null) updateData.skills = req.body.skills;
    if(req.body.technologies != null) updateData.technologies = req.body.technologies;
    if(req.body.tags != null) updateData.tags = req.body.tags;

    Project.update({_id: req.body._id},updateData, function(err,affected) {
          if(err){
            res.statusCode = 500;
            console.log(err);
            return res.send({error : 'Server Error' + JSON.stringify( req.body)});
            
          }else{
            res.statusCode = 200;
            return res.send({status: 'OK'});
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

// Delete Project
deleteProject = function(req, res) {
  if(req.body.user == req.user._id){
    Project.remove({ _id: req.body._id }, function(err) {
        if (!err) {
           res.statusCode = 200;
           return res.send({status: 'OK'});
        }
        else {
          res.statusCode = 500;
          return res.send({error: err});
        }
    });
  }else{
    res.statusCode = 500;
    return res.send({error: err});
  }
}

search = function(req, res) {
  var keyword = req.body.query;
   Project.find({
            'skills':{ "$elemMatch" : {skill: keyword} }}
          , function(err, projects){
            if(err){
              res.statusCode = 500;
              return res.send({error: err});
            }else{
              res.statusCode = 200;
              return res.json(projects);
            }

  });

}

//========================================================
// II. Controller URL to Action mapping
//========================================================
app.get('/project/list/of/:username', getProjects);
app.post('/project', createProject);
app.put('/project', updateProject);
app.post('/project/delete', deleteProject);

app.get('/profile/skills/of/:username', getSkills);
app.get('/profile/:username', getProfile);
app.post('/profile', createProfile);
app.put('/profile', updateProfile);

app.get('/search/:query', search);

module.exports = app;


