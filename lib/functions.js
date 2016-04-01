var multer = require('multer');
var path = require('path');
var util = require('util');

module.exports = {
  unique_id: function() {
    return Math.floor(Math.random() * 5000);
  },
  randomColor: function() {
    return (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256));
  },
  upload: function(fields)  {
    var unique_id = this.unique_id();
    var storage = multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, './public/uploads/');
      },
      filename: function(req, file, cb) {
        cb(null, unique_id + Date.now() + path.extname(file.originalname));
      }
    });
    var upload = multer({storage: storage});
    if (util.isArray(fields)) {
      return upload.fields(fields);
    } else {
      return upload.single(fields);
    }
  },
  errors: function(errors) {
    if (typeof errors === 'string') { return [errors]; }

    errors = errors || {};
    const keys = Object.keys(errors);
    const errs = [];

    // if there is no validation error, just display a generic error
    if (!keys) {
      errs.push('Oops! There was an error');
      return errs;
    }

    keys.forEach(function(key) {
      errs.push(errors[key].message);
    });

    return errs;
  },
  isEmptyObject: function(obj) {
    if (!obj) { return false; }
    return Object.keys(obj).length === 0;
  }
};
