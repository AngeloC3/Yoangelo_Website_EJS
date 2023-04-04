const User = require('../models/User');
const LocalStrategy = require('passport-local').Strategy;

const updateLastLogin = async (user, done) => {
    user.lastLogin = Date.now(); // updates the last time a user logged in
    await user.save().then(() => {
        return done(null, user);
    }).catch((err) => {
        return done(err);
    });
};

const setUpLocalPassport = (passport) => {
    passport.use(new LocalStrategy(
        { usernameField: "email" },
        (email, password, done) => {
            User.authenticate()(email, password, function(err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false); }
                return updateLastLogin(user, done);
            });
        }
    ));
};

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
                    return updateLastLogin(existingUser, done);
                }
                // if user does not exist create a new user
                const newUser = new User({
                    method: 'google',
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
};

const setUpPassportSerializers = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
      });
    passport.deserializeUser((id, done) => {
        done(null, id);
    });
    passport.deserializeUser(User.deserializeUser()); // DO  I NEED THIS
}

module.exports = {
    setUpLocalPassport,
    setUpGooglePassport,
    setUpPassportSerializers,
}