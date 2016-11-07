'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');
var url = require('url');
var Client = require('node-rest-client').Client;

const _defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*'
  },
  responseConfig: {
    timeout: 1000 //response timeout
  },
  data: {}
};
//client.registerMethod("xmlMethod", "http://remote.site/rest/xml/${id}/method", "POST");

exports.getURL = function(type) {
  if (!process.env.LA_URL) {
    return false;
  }
  let url_path = type ? type + '/' : '';
  return process.env.LA_URL + '/api/' + url_path;
};
exports.getHeaders = function() {
  this.headers = {
    'Content-Type': 'application/json',
    'Accept': '*/*'
  };
  return this.headers;
};

exports.emit = function(type, data, callback) {
  if (!this.getURL()) {
    return false;
  }
  // argumentos que se le pasará a la url por el método POST

  const options = data ? {data: data} : {};
  data.scope = type;
  let properties = _.extend(_defaultOptions, options);
  if (typeof callback !== 'function') {
    callback = function() {};
  }
  const client = new Client();
  const req = client.post(
    this.getURL(type),
    properties,
    callback
  );
  req.on('requestTimeout', onRequestTimeout);
  req.on('responseTimeout', onResponseTimeout);
  req.on('error', onError);
};

/**
 * Events handlers de las peticiones API Rest
 *
 * @param {Object} req
 */
function onRequestTimeout(req) {
  console.log('request has expired');
  req.abort();
}

function onResponseTimeout(req) {
  console.log('response has expired');
  req.abort();
}

function onError(err) {
  console.log('request error', err);
}
