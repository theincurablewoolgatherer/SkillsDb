var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
var passport = require('passport');
var session      = require('express-session');

var apiController = require('./app/controllers/api');
var appController = require('./app/controllers/index');
var profileController = require('./app/controllers/profile');
var projectController = require('./app/controllers/project');
var app = express();
// Configuration ===================================================

// mongoDb connection through mongoose
mongoose.connect('mongodb://root:1234@localhost:27017/srph_skillsdb?authSource=admin')

app.set('views', path.join(__dirname, '/app/views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Required for Authentication Middleware using Passport
require('./sec_modules/authentication')(passport);
app.use(session({secret: 'obladioblada', 
                 saveUninitialized: true,
                 resave: true})); // session secret
app.use(passport.initialize());
app.use(passport.session());

// Routes ===========================================================
app.use('/profile', profileController);
app.use('/project', projectController);
app.use('/api', apiController);
app.use('/', appController);


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
