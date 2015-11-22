var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({async: true});
var util = require('util');

// Project model
var projectSchema = mongoose.Schema({
    name        : String,
    project     : String,
    data        : String,
    images      : [],
    players      : [{type: Schema.Types.ObjectId, ref: 'User' }],
    activities  : [{type: Schema.Types.ObjectId, ref: 'Activity'}],
    // Propiedades extra del proyectos
    properties  : {
        numPlayers     : Number
    },
    createdDate : {type: Date, default: Date.now}
});
projectSchema.methods.load = function() {

};
projectSchema.methods.setActivities = function() {
    var project = this;
    // Cargamos las actividades del XML
    var file = 'uploads/'+this.project +'/'+ this.data;

    this.loadXML(file)
    .on('end', function (XML) {
        var activities = [];
        XML.Project.Activity.forEach(function(activity){
            obj_activity = new Activity({
                project_id: project._id
            });
            // @todo crear actividades desde XML
            obj_activity.saveFromXML(activity);

            obj_activity
                .setElements(activity.Arealist[0].Area)
                .setObjectives(activity.Objectives)
                .save();
            activities.push(obj_activity);
        });
        project.activities = activities;
        project.save();
    });

};

/**
 *
 * @param file
 * @returns {exports.Parser}
 */
projectSchema.methods.loadXML = function(file) {

    var data = fs.readFileSync(file);
    parser.parseString(data);
    return parser;
};

/**
 * Statics
 */

projectSchema.statics = {

    /**
     * Buscar proyecto por id
     *
     * @param {ObjectId} id
     * @param {Function} cb
     * @api private
     */

    load: function (id, cb) {
        this.findOne({_id: id})
            //.populate('user', 'name email username')
            //.populate('comments.user')
            .exec(cb);
    }
}

mongoose.model('Project', projectSchema);


// Objective model
var objectiveSchema = mongoose.Schema({
    project_id     : { type: Schema.Types.ObjectId, ref: 'Project' },
    players        : [{type: Schema.Types.ObjectId, ref: 'User' }],
    cards          : [{type: Schema.Types.ObjectId, ref: 'Card' }]
});
var Objective  = mongoose.model('Objective', objectiveSchema);

// Element model
var elementSchema = mongoose.Schema({

});
elementSchema.methods.setElementType = function() {

};
elementSchema.methods.setCardType = function() {
    //this.card_type = {img, text}
    //this.objective_id = n
    //this.text = string
    //this.images = array
};
var Element  = mongoose.model('Element', elementSchema);

// Action model
var actionSchema = mongoose.Schema({
    player_id       : { type: Schema.Types.ObjectId, ref: 'User' },
    action          : String,
    answered        : Boolean,
    done            : Boolean,
    element_id      : { type: Schema.Types.ObjectId, ref: 'Element' },
    createdDate     : {type: Date, default: Date.now}
});
var Action  = mongoose.model('Action', actionSchema);