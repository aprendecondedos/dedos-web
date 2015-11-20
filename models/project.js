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

module.exports = mongoose.model('Project', projectSchema);



// Activity model
var activitySchema = mongoose.Schema({
    project_id          : { type: Schema.Types.ObjectId, ref: 'Project' },
    elements            : [{type: Schema.Types.ObjectId, ref: 'Element' }],
    objectives          : [{type: Schema.Types.ObjectId, ref: 'Objective' }]
});

activitySchema.methods.setElements = function(elements) {
    if(util.isArray(elements)) {
        elements.forEach(function(element){
            obj_element = new Element();
            // {id, type}
            console.log(element.$.type);
            element.Tokenlist.forEach(function(token){
                console.log(token);
            });
        });
        return this;
    }
    // Cargamos las actividades del XML
    //var file = 'uploads/'+this.project +'/'+ this.data;
    //this.prueba = [{'OBJETIVO_id': {done: false, answered: false} }];
};
activitySchema.methods.setObjectives = function(objectives) {
    objectives.forEach(function(objective){
        obj_objective = new Objective().save();
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