/**
*   Contains routes for showing Profile views.
*
*/
var express = require('express');
var passport = require('passport');
var User = require(__dirname+'/../models/user');
var app = express.Router();


//========================================================
// I. Controller actions
//========================================================

showProfilePage = function (req, res) {
  if(req.isAuthenticated())
        res.render('partials/profile',{ title : 'SkillsDb ' });
    else
        res.redirect("/");    
}

showProfilePageOfUser = function (req, res) {
  if(req.isAuthenticated()){
        res.render('partials/profile',{ title : 'SkillsDb - ' + req.params.username, profile_viewer: req.user});
  }
    else
        res.redirect("/");    
}
//========================================================
// II. Controller URL to Action mapping
//========================================================
app.get('/', showProfilePage);
app.get('/:username', showProfilePageOfUser);

module.exports = app;


