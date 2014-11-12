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
        res.render('partials/profile',{ title : 'Skills[db] | Profile ' });
    else
        res.redirect("/");    
}

//========================================================
// II. Controller URL to Action mapping
//========================================================
app.get('/', showProfilePage);


module.exports = app;


