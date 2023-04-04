const User = require('../models/User')

// google strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const setUpGooglePassport = (passport) => {
    let callbackURL = process.env.HOST_URL || 'http://localhost:5000';
    callbackURL += "/auth/google/callback";
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackURL,
        passReqToCallback : true
        },
        async (request, accessToken, refreshToken, profile, done) => {
            try {
                let existingUser = await User.findOne({ 'google.id': profile.id });
                // if user exists return the user
                if (existingUser) {
                    return done(null, existingUser);
                }
                // if user does not exist create a new user
                console.log('Creating new user...');
                const newUser = new User({
                    method: 'google', // delete?
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    google: {
                        id: profile.id,
                    }
                });
                await newUser.save();
                return done(null, newUser);
            } catch (error) {
                return done(error, false)
            }
        }
    ));
}

module.exports = {
    setUpGooglePassport,
}