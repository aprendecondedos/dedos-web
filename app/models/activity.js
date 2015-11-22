var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var util = require('util');

// Activity model
var activitySchema = new Schema({
    project_id   : { type: Schema.Types.ObjectId, ref: 'Project' },
    objectives   : [{type: Schema.Types.ObjectId, ref: 'Objective' }]
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
    saveFromXML: function(xml_data) {
        this
            .setElements(xml_data.Arealist[0].Area)
            .setObjectives(xml_data.Objectives);
    },
    setObjectives: function(objectives) {
        objectives.forEach(function(objective){
            obj_objective = new Objective().save();
        });
        return this;
    },
    setElements: function(elements) {
        if (util.isArray(elements)) {
            elements.forEach(function (element) {
                obj_element = new Element();
                // {id, type}
                console.log(element.$.type);
                element.Tokenlist.forEach(function (token) {
                    console.log(token);
                });
            });
            return this;
        }
    }
};


mongoose.model('Activity', activitySchema);
