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
/**
 * Carga y guardado de actividades antes de guardar el project
 *
 */
//projectSchema.pre('save', function(next) {
//    this.setActivities();
//    next();
//});

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
            //obj_activity
            //    .setElements();
            obj_activity.save();
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

projectSchema.methods.updateUser = function(request, response){

    this.user.name = request.body.name;
    this.user.address = request.body.address;
    this.user.save();
    response.redirect('/user');
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
//activitySchema.pre('save', function(next) {
//    //this.setElements();
//    //this.setObjectives();
//    next();
//});

activitySchema.methods.setElements = function() {
    var project = this;
    // Cargamos las actividades del XML
    //var file = 'uploads/'+this.project +'/'+ this.data;
    console.log(this);
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
