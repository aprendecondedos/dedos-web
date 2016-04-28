var mongoose = require('mongoose');
var Teacher = mongoose.model('Teacher');

var local = require('./passport/local');
var facebook = require('./passport/facebook');
var twitter = require('./passport/twitter');

/**
 * Expose
 */

module.exports = function(passport) {
  // serialize sessions
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    Teacher.load({criteria: {_id: id}}, function(err, user) {
      done(err, user);
    });
  });
  // use these strategies
  passport.use(local);
  passport.use(facebook);
  passport.use(twitter);
};