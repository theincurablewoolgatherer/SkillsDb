var express = require('express');
var app = express.Router();
var passport = require('passport');
var User = require(__dirname+'/../models/user');

// Define a middleware function to be used for every secured routes
var auth = function(req, res, next){
    if (!req.isAuthenticated()) 
        res.send(401);
    else
        next();
};

app.get('/', function(req, res){
    //res.render('index', { title: 'SkillsDB' });
    if(req.isAuthenticated())
        res.redirect("/profile");
    else
         res.render('partials/login');
    
});

/*
app.get('/profile', auth, function(req, res){
    res.send([{name: "user1"}, {name: "user2"}]);
   // res.render('profile', { title: 'PROFILE' });
});
*/

app.post('/login', passport.authenticate('local'), function(req, res) {
    res.send(req.user);
});

app.post('/logout', function(req, res){
    req.logOut();
    res.send(200);
});


// route to test if the user is logged in or not
app.get('/loggedin', function(req, res) {
    res.send(req.isAuthenticated() ? req.user : '0');
});


// route for angular partials
app.get('/partials/:name', function (req, res)
 { var name = req.params.name;
   res.render('partials/' + name);
});

// Fallback route
app.get('*', function(req, res){
    res.redirect("/");
});



module.exports = app;
