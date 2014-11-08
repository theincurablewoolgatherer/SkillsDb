var express = require('express');
var passport = require('passport');
var User = require(__dirname+'/../models/user');
var app = express.Router();


//========================================================
// I. Controller actions
//========================================================

// Retrieve single Profile
getProfile = function(req, res) {
    User.findById(req.params.id, function(err, profile){
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
    User.findById(req.params.id, function(err, profile){
        if(!profile){
            res.statusCode = 404;
            return res.send({error: 'Not found'});
        }
        
        // Update fields
        if(req.body.firstname != null) profile.firstname = req.body.firstname;
        if(req.body.lastname != null) profile.lastname = req.body.lastname;
        if(req.body.department != null) profile.department = req.body.department;
        if(req.body.rank != null) profile.rank = req.body.rank;
        if(req.body.position != null) profile.position = req.body.position;
        
        // save profile
        return profile.save(function(err){
            if(!err){
                return res.send({status: 'OK', user:profile});
            }else{
                res.statusCode = 500;
                return res.send({error : 'Server Error'});
            }
        });
    });
}

// Create Profile
createProfile = function(req, res) {

}
//========================================================
// II. Controller URL to Action mapping
//========================================================
app.get('/:id', getProfile);
app.put('/:id', updateProfile);
app.post('/', createProfile);

module.exports = app;


