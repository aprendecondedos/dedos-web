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
  answers: [{type: Schema.Types.ObjectId, ref: 'Answer'}]
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
  saveFromXML: function(XML_data) {
      this
        .setObjectivesFromXML(XML_data.Objectives)
        .setElementsFromXML(XML_data.Arealist)
        .save();
    },
  setObjectivesFromXML: function(XML_data) {
      var objectives = [];
      XML_data.forEach(function(objectives_data) {
        if (typeof objectives_data != 'object') return;

        objectives_data.obj.forEach(function(objective_data) {

          if (objective_data.$.type == 'sel') {
            var objective = new Selection(objective_data.$);
          } else if (objective_data.$.type == 'pair') {
            var objective = new Pair(objective_data.$);

            // set targets
            var targets = [];
            objective_data.Targets.forEach(function(targets_data) {
              targets_data.target.forEach(function(target_data) {
                targets.push(target_data.$.name);
              });
            });
            objective.setTargets(targets);
          }
          //var objective = new Objective(objective_data.$);
          if (objective) {
            objective.save();
            objectives.push(objective);
          }
        });
      });

      this.setObjectives(objectives);
      return this;
    },
  setElementsFromXML: function(XML_data) {
      var elements = [];
      XML_data.forEach(function(area_list) {
        if (typeof area_list != 'object') return;

        area_list.Area.forEach(function(area_data) {
          var area = new Area({
            element_id: area_data.$.id,
            type: area_data.$.type,
            position: area_data.pos.pop().$,
            size: area_data.size.pop().$,
            bg: area_data.bg.pop().$.url
          });

          // Set tokens (cards)
          var tokens = [];
          area_data.Tokenlist.forEach(function(tokens_data) {
            if (typeof tokens_data != 'object') return;

            tokens_data.Token.forEach(function(token_data) {
              var token = new Token({
                element_id: token_data.$.id,
                type: token_data.$.type,
                value: token_data.$.numValue,
                position: token_data.pos.pop().$,
                size: token_data.size.pop().$,
                clickable: token_data.clickable.pop(),
                rotatable: token_data.rotatable.pop(),
                resizable: token_data.resizable.pop(),
                movable: token_data.movable.pop(),
                feedback: token_data.content[0].feedback.pop()
              });
              if (token_data.$.type == 'img') {
                token.setUrls(token_data.content[0].urlList[0].url);
              } else if (token_data.$.type == 'txt') {
                token.text = token_data.content[0].text[0];
              }
              token.save();
              tokens.push(token);
              elements.push(token);
            });
          });
          area.setTokens(tokens);
          area.save();
          elements.push(area);
        });
      });

      this.setElements(elements);
      return this;
    },
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
   * Comprobación si la actividad se ha resuelto correctamente
   * y si se puede dar por finalizada
   *
   * @param {Object} answer
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
    if (properties.failNotAllowed == 'true') {
      if (_.where(answer.elements, {valid: false}).length > 0) {
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
   * @param {Function} cb
   * @api private
   */

  load: function(options) {
    const criteria = options.criteria || {_id: options};
    return this.findOne(criteria)
        .populate('objectives')
        .populate('answers')
        .populate('elements')
        .exec();
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
