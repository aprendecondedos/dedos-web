var _ = require('underscore');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Answer model
var AnswerSchema = mongoose.Schema({
  player: {type: Schema.Types.ObjectId, ref: 'Player'},
  activityData: {
    activity: {type: Schema.Types.ObjectId, ref: 'Activity'},
    valid: {type: Boolean, default: false},
    finished: {type: Boolean, default: false}
  },
  elements: [{
    token: {type: Schema.Types.ObjectId, ref: 'Token'},
    value: String,
    target: {type: Schema.Types.ObjectId, ref: 'Token'},
    action: String,
    valid: Boolean,
    objective: {type: Schema.Types.ObjectId, ref: 'Objective'},
  }],
  createdDate: {type: Date, default: Date.now},
  updatedDate: {type: Date, default: Date.now}
});

/**
 * Hooks
 */
AnswerSchema.pre('save', function(next) {
  this.updatedDate = Date.now();

  next();
});

/**
 * Methods
 *
 * @type {{}}
 */
AnswerSchema.methods = {
  /**
   * Modifica propiedades a un elemento existente
   * si no existiera se crea y añade el elemento
   *
   * @param {Object} element_data Propiedades del nuevo/existente elemento
   * @returns {AnswerSchema}
   */
  addElement: function(element_data) {
    var elementExists = false;
    _.find(this.elements, function(element) {
      if (element.token == element_data.token) {
        elementExists = true;
        // Se elimina el objeto token para evitar incompatibilidades con Mongo
        delete element_data.token;
        _.extendOwn(element, element_data);
      }
    });
    if (!elementExists) {
      this.elements.push(element_data);
    }
    return this;
  },
  isTokenAnswered: function(token_id) {
    if (this.elements.length == 0) {
      return false;
    }
    return this.elements.some(function(element) {
      return element.token.equals(token_id);
    });
  },
  getTokenById: function(token_id) {
    if (this.elements.length == 0) {
      return false;
    }
    return this.elements.find(function(element) {
      return element.token.equals(token_id);
    });
  },
  getCurrentValue: function(token_id) {
    var value = 0;
    if (this.elements.length == 0) {
      return value;
    }
    this.elements.forEach(function(element) {
      if (element.target == token_id) {
        value = value + Number(element.value);
      }
    });
    return value;
  },
  getPair: function(token_id) {
    if (this.elements.length == 0) {
      return false;
    }
    var result = false;
    this.elements.forEach(function(element) {
      if (element.token == token_id) {
        if (element.target) {
          result =  {
            origin: element.token,
            target: element.target
          };
        }
      }
    });
    return result;
    return false;
  },
  countToken: function(token_id, type) {
    var value = 0;
    if (this.elements.length == 0) {
      return value;
    }
    this.elements.forEach(function(element) {
      if (element.token == token_id && element.action == type) {
        value = value + 1;
      }
    });
    return value;
  }
};
/**
 * Statics
 */

AnswerSchema.statics = {
  /**
   * Buscar respuesta por id o por criterio
   *
   * @param {ObjectId} options
   */
  load: function(options, cb) {
    const criteria = options.criteria || {_id: options};
    return this.findOne(criteria)
      .populate('elements')
      .exec(cb);
  },
  /**
   * Listar respuestas y filtrarlos
   *
   * @param {Object} options
   * @property {Object} criteria
   * @property {Number} page
   * @property {Number} limit
   * @property {Array} populate
   */
  list: function(options, cb) {
    const criteria = options.criteria || {};
    const page = options.page || 0;
    const limit = options.limit || 30;
    const populate = options.populate || [];
    return this.find(criteria)
      .sort({createdDate: -1})
      .limit(limit)
      .populate(populate)
      //.populate('player', 'name')
      .skip(limit * page)
      .exec(cb);
  },
  /**
   * Obtener answers dado una o varias actividades
   *
   * @param {Array|String} activities
   * @returns {*}
   */
  getFromActivities: function(activities,players) {

    var arrayId = new Array();
    players.forEach(function(player, index){
      arrayId.push(player.user._id);
    });
    console.log(arrayId);
    return this.list({
      criteria: {
        'player': {$in: arrayId},
        'activityData.activity': {$in: activities}
      },
      populate:  [{path: 'player', select: 'name'}, {path: 'elements.token'}, {path: 'elements.target'}]
    });
  }
};

mongoose.model('Answer', AnswerSchema);
