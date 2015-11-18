var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var xml2js = require('xml2js');
var parser = new xml2js.Parser({async: false});

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
    var project_id = this._id;

    // Cargamos las actividades del XML
    var file = 'uploads/'+this.project +'/'+ this.data;
    //console.log(activity.loadFromXML(file));
    var activities = [];
    this.loadXML(file)
    .on('end', function (XML) {
        XML.Project.Activity.forEach(function(activity){
            activities.push(
                new Activity({
                    project_id: project_id,
                    //type        : String
                })
            );
        });
        console.log(activities);
        return activities;
    });
    console.log(this.activities);
};
projectSchema.post('init', function(doc) {
    console.log('%s has been initialized from the db', doc._id);
});

projectSchema.methods.loadXML = function(file) {

    var data = fs.readFileSync(file);
    parser.parseString(data, function (err, result) {
        return result.Project;
    });
    return parser;
};
projectSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

projectSchema.methods.verifyPassword = function(password) {
    return bcrypt.compareSync(password, this.user.password);
};

projectSchema.methods.updateUser = function(request, response){

    this.user.name = request.body.name;
    this.user.address = request.body.address;
    this.user.save();
    response.redirect('/user');
};


module.exports = mongoose.model('Project', projectSchema);

// Activity model
var fs = require('fs');
var xml2js = require('xml2js');
var activitySchema = mongoose.Schema({
    project_id  : { type: Number, ref: 'Project' },
    type        : String,
    //elements    : {type: [], ref: 'Element' },
    //objectives  : {type: [], ref: 'Objective' },
});
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
