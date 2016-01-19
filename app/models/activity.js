var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var util = require('util');

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
        .populate('elements')
        .exec();
  }
};

mongoose.model('Activity', ActivitySchema);
