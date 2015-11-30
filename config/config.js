var path = require('path');
var extend = require('util')._extend;

var development = require('./env/development');
var test = require('./env/test');
var production = require('./env/production');

var mandrillTransport = require('nodemailer-mandrill-transport');

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
    transporter: null,
    /**
     * MandrillApp
     */
    transporter: mandrillTransport({
        auth:{
            apiKey: 'oUDJQIP_RDb7T2Xvr_-vCA'
        }
    })


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