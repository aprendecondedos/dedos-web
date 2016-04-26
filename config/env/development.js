/*!
 * Module dependencies.
 */
var mandrillTransport = require('nodemailer-mandrill-transport');
var fs = require('fs');
var env = {};
var envFile = require('path').join(__dirname, 'env.json');

// Read env.json file, if it exists, load the id's and secrets from that
// Note that this is only in the development env
// it is not safe to store id's in files

if (fs.existsSync(envFile)) {
  env = fs.readFileSync(envFile, 'utf-8');
  env = JSON.parse(env);
  Object.keys(env).forEach(function(key) {
    process.env[key] = env[key];
  });
}
if (!process.env.BASE_URL) {
  process.env.BASE_URL = 'http://127.0.0.1:3000';
}
/**
 * Expose
 */
module.exports = {
  baseUrl: process.env.BASE_URL,
  db: 'mongodb://' + process.env.DATABASE_SERVER + '/' + process.env.DATABASE_TABLE,
  mailer: {
    from: 'info@aprendecondedos.es',
    /**
     * Ejemplo con datos de Gmail
     */
    transporter: {
      service: 'Gmail',
      auth: {
        user: 'gmail.user@gmail.com',
        pass: 'userpass'
      }
    },
    /**
     * Servidor propio
     */
    transporter: null,
    /**
     * MandrillApp
     */
    transporter: mandrillTransport({
      auth: {
        apiKey: process.env.MAILER_MANDRILL_APIKEY
      }
    })
  },
  facebook: {
    clientID: process.env.FACEBOOK_CLIENTID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: process.env.BASE_URL + '/auth/facebook/callback'
  },
  twitter: {
    clientID: process.env.TWITTER_CLIENTID,
    clientSecret: process.env.TWITTER_SECRET,
    callbackURL: process.env.BASE_URL + '/auth/twitter/callback'
  }
};