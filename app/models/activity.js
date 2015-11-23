var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var util = require('util');

// Activity model
var activitySchema = new Schema({
    project_id   : { type: Schema.Types.ObjectId, ref: 'Project' },
    objectives   : [{type: Schema.Types.ObjectId, ref: 'Objective' }],
    elements     : [{type: Schema.Types.ObjectId, ref: 'Elements' }]
});
/**
 * Hooks
 */
activitySchema.pre('save', function (next) {
    next();
});
/**
 * Methods
 *
 * @type {{}}
 */
activitySchema.methods = {

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


mongoose.model('Activity', activitySchema);
