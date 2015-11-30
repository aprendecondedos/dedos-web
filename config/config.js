var path = require('path');
var extend = require('util')._extend;

var development = require('./env/development');
var test = require('./env/test');
var production = require('./env/production');

var mailer = {
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
    transporter: null
};

var defaults = {
    root: path.join(__dirname, '..'),
    mailer: mailer
};


module.exports = {
    development: extend(development, defaults),
    test: extend(test, defaults),
    production: extend(production, defaults)
}[process.env.NODE_ENV || 'development'];