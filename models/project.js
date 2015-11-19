var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({async: true});

var projectSchema = mongoose.Schema({
    name        : String,
    project     : String,
    data        : String,
    images      : [],
    players     : Number,
    activities  : [{type: Schema.Types.ObjectId, ref: 'Activity'}],
    createdDate : {type: Date, default: Date.now}
});

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
            obj_activity
                //.setElements()
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

module.exports = mongoose.model('Project', projectSchema);

// Activity model


var activitySchema = mongoose.Schema({
    project_id          : { type: Schema.Types.ObjectId, ref: 'Project' },
    numPlayersAnswered  : {type: Number, default: 0},
    numSuccessAnswers   : {type: Number, default: 0},
    elements            : [{type: Schema.Types.ObjectId, ref: 'Element' }],
    objectives          : [{type: Schema.Types.ObjectId, ref: 'Objective' }]
});

activitySchema.methods.setElements = function(dataXML) {
    var activity = this;
    // Cargamos las actividades del XML
    //var file = 'uploads/'+this.project +'/'+ this.data;
    //this.prueba = [{'OBJETIVO_id': {done: false, answered: false} }];
};
activitySchema.methods.setObjectives = function(objectives) {
    objectives.forEach(function(objective){
        obj_objective = new Objective();
        obj_objective.save();
    });
    return this;
};

activitySchema.methods.loadFromXML = function(file) {
  var parser = new xml2js.Parser();
    fs.readFile(file, function(err, data) {
        parser.parseString(data, function (err, result) {
          //console.dir(result);
          console.log('Done!!');
        });
  });
};

var Activity  = mongoose.model('Activity', activitySchema);


// Objective model
var objectiveSchema = mongoose.Schema({
    project_id     : { type: Schema.Types.ObjectId, ref: 'Project' },
    players        : [{type: Schema.Types.ObjectId, ref: 'Player' }],
    cards          : [{type: Schema.Types.ObjectId, ref: 'Card' }]
});
var Objective  = mongoose.model('Objective', objectiveSchema);

// Element model
var elementSchema = mongoose.Schema({
    project_id     : { type: Schema.Types.ObjectId, ref: 'Project' },
    players        : [{type: Schema.Types.ObjectId, ref: 'Player' }],
    cards          : [{type: Schema.Types.ObjectId, ref: 'Card' }]
});
var Element  = mongoose.model('Element', elementSchema);