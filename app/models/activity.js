var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var util = require('util');
var wrap = require('co-express');
var _ = require('underscore');

// Activity model
var ActivitySchema = new Schema({
  project: {type: Schema.Types.ObjectId, ref: 'Project'},
  objectives: [{type: Schema.Types.ObjectId, ref: 'Objective'}],
  elements: [{type: Schema.Types.ObjectId, ref: 'Element'}],
  answers: [{type: Schema.Types.ObjectId, ref: 'Answer'}],
  groups: [{
    id: {type: Schema.Types.ObjectId},
    finished: {type: Boolean, default: false},
    players: [{
      user: {type: Schema.Types.ObjectId, ref: 'User'},
      active: {type: Boolean, default: false},
      finished: {type: Boolean, default: false}
    }]
  }],
  updatedDate: {type: Date, default: Date.now}
});

/**
 * Hooks
 */
ActivitySchema.pre('save', function(next) {
  next();
});

ActivitySchema.pre('remove', function(next) {
  var self = this;
  this.model('Element').remove({activity: this._id}, function() {
    self.model('Objective').remove({activity: self._id}, next);
  });
});

/**
 * Methods
 *
 * @type {{}}
 */
ActivitySchema.methods = {
  setObjectives: function(objectives) {
    if (util.isArray(objectives)) {
      this.objectives = objectives;
      return this;
    }
  },
  setElements: function(elements) {
    if (util.isArray(elements)) {
      this.elements = elements;
      return this;
    }
  },
  addAnswer: function(answer_id) {
    var answerExists = false;
    _.find(this.answers, function(answer) {
      if (answer == answer_id) {
        answerExists = true;
      }
    });
    if (!answerExists) {
      this.answers.push(answer_id);
    }
    return this;
  },
  addAnswerx: function(answer) {
    this.answers.push(answer);
    return this;
  },
  setAnswers: function(answers) {
    var self = this;
    this.answers = [];
    answers.forEach(function(answer) {
      self.addAnswer(answers);
    });
    return this;
  },
  getAnswers: function(options) {
    var defaults = {
      criteria: {
        '_id': {$in: this.answers}
      }
    };
    return this.model('Answer').list(_.extend(defaults, options));
  },
  /**
   *
   * @param {Number} player_id
   * @param {Number} max_players
   * @returns {Object} group
   */
  assignPlayerToGroup: function(player_id, max_players) {
    var group = this.hasGroup(player_id);
    if (_.isEmpty(group)) {
      var group_not_full = _.find(this.groups, function(group) {
        return group.players.length < max_players && group.finished == false;
      });
      // Se crea un grupo si se encuentran todos los grupos completos
      if (_.isEmpty(group_not_full)) {
        var i = this.groups.push({});
        group = this.groups[i - 1];
        group.players.push({user: player_id});
      } else {
        group = group_not_full;
        // Se añade el usuario al grupo que no este totalmente completo
        group.players.push({user: player_id});
      }
    }
    return group;
  },
  hasGroup: function(player_id) {
    var result = {};
    this.groups.forEach(function(group) {
      _.find(group.players, function(player) {
        if (player.user._id.toString() == player_id.toString()) {
          result = group;
        }
      });
    });
    return result;
  },
  getGroupById: function(group_id) {
    return _.find(this.groups, function(objectGroup) {
      return String(objectGroup._id) === String(group_id);
    });
  },
  setPropertiesFromPlayerGroup: function(group_id, player_id, properties) {
    var group = this.getGroupById(group_id);
    if (group) {
      var player = _.find(group.players, function(objectPlayer) {
        return String(objectPlayer.user._id) === String(player_id);
      });
      player = _.extendOwn(player, properties);
      return player;
    }
    return false;
  },
  /**
   * Comprobación si la actividad se ha resuelto correctamente
   * y si se puede dar por finalizada
   *
   * @param {Object} answer
   * @param {Object} properties Propiedades del proyecto
   * @returns {{finishedActivity: boolean, activityResult: boolean}}
   */
  check: function(answer, properties) {
    var activity_result = true;
    var activity_finished = false;
    var totalObjectives = new Array(this.objectives.length).fill(false);
    var objectivesNotDone = [];

    this.objectives.forEach(function(objective, index) {
      totalObjectives[index] = objective.isDone(answer);
      // Si el objetivo no ha sido completado lo añadimos a un array.
      if (totalObjectives[index] == false) {
        objectivesNotDone.push(objective);
      }
    });

    /* Si hay algun elemento que hemos contestado incorrectamente finalizamos la actividad aunque el usuario
    haya completado objetivos de forma correcta
     */
    var not_valid_tokens = _.where(answer.elements, {valid: false});
    if (properties.failNotAllowed == 'true') {
      if (not_valid_tokens.length > 0) {
        return {
          activityResult: false,
          finishedActivity: true,
          objectivesNotDone: objectivesNotDone
        };
      }
    }

    // Comprobación si la actividad está completada
    // si todos los objetivos han sido respondidos

    // Recogemos todos los objetivos que esten correctos
    var numberOfCorrectAnswers = _.countBy(totalObjectives, _.identity).true;
    activity_finished = false;
    if (answer.elements.length == numberOfCorrectAnswers ||
      answer.elements.length > numberOfCorrectAnswers) {
      if (totalObjectives.indexOf(false) == -1) {
        // Se han cumplido todos los objetivos, pero en el camino el usuario ha fallado
        if (properties.required == 'true' && not_valid_tokens.length > 0) {
          activity_result = false;
        }
        activity_finished = true;
      } else {
        activity_finished = false;
      }
    }
    return {
      activityResult: activity_result,
      finishedActivity: activity_finished,
      objectivesNotDone: objectivesNotDone
    };
  }
};

/**
 * Statics
 */

ActivitySchema.statics = {

  /**
   * Buscar proyecto por id
   *
   * @param {ObjectId} options
   */
  load: function(options, cb) {
    const criteria = options.criteria || {_id: options};
    return this.findOne(criteria)
      .populate('objectives')
      .populate('answers')
      .populate('elements')
      .populate('groups.players.user')
      .exec(cb);
  },
  /**
   * Listar actividades y filtrarlos
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
      .skip(limit * page)
      .exec(cb);
  }
};

mongoose.model('Activity', ActivitySchema);
