var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var util = require('util');

// Activity model
var ActivitySchema = new Schema({
    project_id   : { type: Schema.Types.ObjectId, ref: 'Project' },
    objectives   : [{type: Schema.Types.ObjectId, ref: 'Objective' }],
    elements     : [{type: Schema.Types.ObjectId, ref: 'Element' }]
});
/**
 * Hooks
 */
ActivitySchema.pre('save', function (next) {
    next();
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
    }
};

/**
 * Statics
 */

ActivitySchema.statics = {

    /**
     * Buscar proyecto por id
     *
     * @param {ObjectId} id
     * @param {Function} cb
     * @api private
     */

    load: function (id, cb) {
        this.findOne({_id: id})
            .populate('objectives')
            .populate('elements')
            .exec(cb);
    }
}

mongoose.model('Activity', ActivitySchema);
