var path = require('path');
var extend = require('util')._extend;

var development = require('./env/development');
var test = require('./env/test');
var production = require('./env/production');

var defaults = {
    root: path.join(__dirname, '..'),
    //notifier: notifier
};

module.exports = {
    development: extend(development, defaults),
    production: extend(production, defaults),
    test: extend(test, defaults)
};