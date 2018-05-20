const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const strategy = new LocalStrategy(
  function(username, password, done) {
    UserDetail.findOne({
        username: username
      }, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false);
        }

        if (user.password != password) {
          return done(null, false);
        }
        return done(null, user);
      });
  }
);
const UserDetail = require('../models/account');
passport.use(strategy);
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  UserDetail.findById(id, function(err, user) {
    if (user) {
      return done(null, user);
    }
    else {
      return done(null, false);
    }
  });
});
module.exports = passport;