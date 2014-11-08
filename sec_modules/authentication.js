// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var User       		= require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    // Authentication Logic
    passport.use(new LocalStrategy(function(username, password, done) {
        process.nextTick(function() {
            isMysingleValid = true;

            // Auth Check Logic
            if(isMysingleValid){
                User.findOne({ username: username }, function (err, user) {
                    if (err) {
                        return done(err);
                    }
                    // First time login of User
                    if(!user) {
                        console.log("Create User: " + username);
                        // Create user
                        User.create({
                            username: username
                        }, function(err, user){
                            if(err)
                                res.send(err);
                            // return user after saving
                            return done(null, user);
                        });
                    }
                    else{
                        console.log("Login User: "+user.username);
                        return done(null, user);
                    }
                });
            }else{
                return done(null, false, { message: 'Incorrect mySingle Id or password.' });
            }
        });
    }));
};
