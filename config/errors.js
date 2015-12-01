var i18n = require('../i18n/i18n');

module.exports = function (app) {

  app.use(function (req, res) {
    res.status(404).render('layouts/error', {
      error_code: 404,
      title: i18n.gettext('error:404:title'),
      description: i18n.gettext('error:404:description')
    });
  });


  // Cuando esté en desarrollo hay que mostrar por pantalla los errores del servidor
  if ( app.get('env') === 'development' ) {
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }
};