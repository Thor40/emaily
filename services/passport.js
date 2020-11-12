const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('users');

passport.serializeUser((user, done) => {
    done(null, user.id); // done is callback when we've finished work
    // (error obj or if we ran into errors, identify user for follow-up requests)
    // user.id is mongoDB user ID stored on database (assume every user will have a User ID)
});

passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => { // promise takes user model we just desync'd
            done(null, user)
    });
});

passport.use(new GoogleStrategy({ 
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: '/auth/google/callback'
    }, 
    (accessToken, refreshToken, profile, done) => {
        User.findOne({ googleId: profile.id })
            .then(existingUser => {
                if(existingUser) {
                    // already have record with given profile ID
                    done(null, existingUser); // provide 2 args (if error, user record)
                } else {
                    // dont have user record with this ID, make new record
                    new User({ googleId: profile.id }) // creates mongoose model instance
                        .save() // save instance
                        .then(user => done(null, user)); // in callback get another model instance
                }
            });
        }
    )
); 