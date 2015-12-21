var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var fs = require('fs');
var util = require('util');

// Project model
var ProjectSchema = mongoose.Schema({
    name        : String,
    project     : String,
    description : String,
    screenshots : [],
    path        : String,
    resolution  : {
        x: Number,
        y: Number
    },
    players        : [{
        avatar  : String,
        user    : {type: Schema.Types.ObjectId, ref: 'User'},
        online  : { type : Boolean, default : false }
    }],
    activities  : [{type: Schema.Types.ObjectId, ref: 'Activity'}],
    classroom : {type: Schema.Types.ObjectId, ref: 'Classroom'},
    // Propiedades extra del proyectos
    properties  : {
        numPlayers     : Number
    },
    createdDate : {type: Date, default: Date.now},
    createdBy   : {type: Schema.Types.ObjectId, ref: 'User'}
});


ProjectSchema.methods = {

    setActivities: function(activities) {
        if (util.isArray(activities)) {
            this.activities = activities;
            return this;
        }
    },
    saveFromXML: function(XML_data){
      var self = this;
      var activities = [];
      XML_data.Activity.forEach(function(activity_data){
        if(typeof activity_data != 'object') return;

        var activity = new Activity({ project: self.id });
        activity.saveFromXML(activity_data);
        activities.push(activity);
      });
      this.setActivities(activities);
      return this;
    },
  setActivitiesFromXML: function(XML_data){
      var self = this;
      var activities = [];
      XML_data.Activity.forEach(function(activity_data){
        if(typeof activity_data != 'object') return;

        var activity = new Activity({ project: self.id });
        activity.saveFromXML();
        activity.setObjectivesFromXML(activity_data.Objectives);
        activity.setElementsFromXML(activity_data.Arealist);
        //activity.save();
        activities.push(activity);
      });
      this.setActivities(activities);
      return this;
    },
    addPlayer: function(user_id, data){
      this.players.push({
        avatar: data.avatar,
        user: user_id
      });
      return this;
    }
};

/**
 * Statics
 */

ProjectSchema.statics = {

    /**
     * Buscar proyecto por id
     *
     * @param {ObjectId} id
     * @param {Function} cb
     * @api private
     */

    load: function (options) {
        const criteria = options.criteria || {_id: options};
        return this.findOne(criteria)
            .populate('players', 'name')
            //.populate('comments.user')
            .populate('activities')
            .exec();
    },
    /**
     * Listar proyectos y filtrarlos
     *
     * @param {Object} options
     * @api private
     */

    list: function (options) {
        const criteria = options.criteria || {};
        const page = options.page || 0;
        const limit = options.limit || 30;
        return this.find(criteria)
            .populate('activities')
            .sort({ createdDate: -1 })
            .limit(limit)
            .skip(limit * page)
            .exec();
    }
}

mongoose.model('Project', ProjectSchema);


// Action model
var actionSchema = mongoose.Schema({
    player_id       : { type: Schema.Types.ObjectId, ref: 'User' },
    action          : String,
    answered        : Boolean,
    done            : Boolean,
    element_id      : { type: Schema.Types.ObjectId, ref: 'Element' },
    createdDate     : {type: Date, default: Date.now}
});
var Action  = mongoose.model('ActionXX', actionSchema);