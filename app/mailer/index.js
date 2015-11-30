/**
 * Module dependencies.
 */

const nodemailer = require('nodemailer');
var swig = require('swig');
var i18n = require('../../i18n/i18n');
var config = require('../../config/config');
var extend = require('util')._extend;
var path = require('path');

/**
 * Process the templates using swig -
 *
 * @param {String} tplPath
 * @param {Object} locals
 * @return {String}
 * @api public
 */

//Notifier.prototype.processTemplate = function (tplPath, locals) {
//  locals.filename = tplPath;
//  return swig.renderFile(tplPath, locals);
//};

/**
 * Expose
 */

module.exports = {

  /**
   * User notification
   *
   * @param {Object} options
   * @param {Function} cb
   * @api public
   */
  user: {

      register:  function (user, cb) {
        var obj = {
          to: user.email,
          subject: i18n.gettext('mail:subject:user:register'),
          html: renderTemplate('user/register', {
            name: user.name
          })
        };

        return send(obj);
      }
  }
};
function renderTemplate(file, locals){
  var templatesDir = path.join(__dirname, '/templates/');
  console.log(templatesDir+ file);
  return swig.renderFile(templatesDir + file + '.html', locals);
};

function send(options){
  var transporter = nodemailer.createTransport(config.mailer.transporter);
  var defaults = {
    from: config.mailer.from
  };
  options = extend(defaults, options);
  transporter.sendMail(options, function(error, info){
    if(error){
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
}