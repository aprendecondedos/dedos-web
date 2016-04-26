'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const FacebookStrategy = require('passport-facebook').Strategy;
const config = require('../config');
const Teacher = mongoose.model('Teacher');

/**
 * Expose
 */

module.exports = new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    const options = {
      criteria: {'facebook.id': profile.id}
    };
    Teacher.load(options, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        user = new Teacher({
          name: profile.displayName,
          provider: 'facebook',
          email: (profile.emails ? profile.emails[0].value : undefined),
          facebook: profile._json
        });
        user.save(function(err) {
          if (err) { console.log(err); }
          return done(err, user);
        });
      } else {
        return done(err, user);
      }
    });
  }
);
