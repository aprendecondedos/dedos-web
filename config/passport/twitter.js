'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const TwitterStrategy = require('passport-twitter').Strategy;
const config = require('../config');
const Teacher = mongoose.model('Teacher');

/**
 * Expose
 */

module.exports = new TwitterStrategy({
    consumerKey: config.twitter.clientID,
    consumerSecret: config.twitter.clientSecret,
    callbackURL: config.twitter.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    const options = {
      criteria: {'twitter.id_str': profile.id}
    };
    Teacher.load(options, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        user = new Teacher({
          name: profile.displayName,
          username: profile.username,
          provider: 'twitter',
          twitter: profile._json
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
