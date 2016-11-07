var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;
require('./user');
var User = mongoose.model('User');

var TeacherSchema = new Schema({
  email: String,
  hashPassword: String,
  salt: String,
  authToken: String,
  provider: String,
  facebook: {},
  twitter: {},
  github: {},
  google: {},
  linkedin: {},
  classes: [{type: Schema.Types.ObjectId, ref: 'Class'}]
});
var oAuthTypes = [
    'github',
    'twitter',
    'facebook',
    'google',
    'linkedin'
];
var validatePresenceOf = function(value) {
  return value && value.length;
};
/**
 * Hooks
 */
TeacherSchema.pre('save', function(next) {
  if (!this.isNew) {
    return next();
  }

  if (!validatePresenceOf(this.password) && !this.skipValidation()) {
    next(new Error('Invalid password'));
  } else {
    next();
  }
});

/**
 * Validations
 */

User.schema.path('name').validate(function(name) {
  if (this.skipValidation()) {
    return true;
  }
  return name.length;
}, 'Name cannot be blank');

TeacherSchema.path('email').validate(function(email) {
  if (this.skipValidation()) {
    return true;
  }
  return email.length;
}, 'Email cannot be blank');

TeacherSchema.path('email').validate(function(email, fn) {
  const User = mongoose.model('User');
  if (this.skipValidation()) {
    fn(true);
  }

  // Check only when it is a new user or when email field is modified
  if (this.isNew || this.isModified('email')) {
    User.find({email: email}).exec(function(err, users) {
      fn(!err && users.length === 0);
    });
  } else {
    fn(true);
  }
}, 'Email already exists');

TeacherSchema.path('hashPassword').validate(function(hashPassword) {
  if (this.skipValidation()) {
    return true;
  }
  return hashPassword.length && this._password.length;
}, 'Password cannot be blank');

/**
 * Virtuals
 */

TeacherSchema
    .virtual('password')
    .set(function(password) {
      this._password = password;
      this.salt = this.makeSalt();
      this.hashPassword = this.encryptPassword(password);
    })
    .get(function() {
      return this._password;
    });

/**
 * Methods
 *
 * @type {{}}
 */
TeacherSchema.methods = {
  /**
   * Autenticación - comprobar que las contraseñas sean la misma
   *
   * @param {String} plainText
   * @return {Boolean}
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashPassword;
  },

  /**
   * Hacer salt a la contraseña
   *
   * @return {String}
   */
  makeSalt: function() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   */
  encryptPassword: function(password) {
    if (!password) {
      return '';
    }
    try {
      return crypto
          .createHmac('sha1', this.salt)
          .update(password)
          .digest('hex');
    } catch (err) {
      return '';
    }
  },
  skipValidation: function() {
    return ~oAuthTypes.indexOf(this.provider);
  }
};
TeacherSchema.statics = {

  /**
   * Load
   *
   * @param {Object} options
   * @param {Function} cb
   */
  load: function(options, cb) {
    options.select = options.select || 'name';
    this.findOne(options.criteria)
        .select(options.select)
        .exec(cb);
  }
};

var Teacher = User.discriminator('Teacher', TeacherSchema);
