var mongoose = require('mongoose');
var Classroom = mongoose.model('Classroom');


exports.load = function(req, res, next, id) {
    Classroom.load(id, function (err, classroom) {
        if (err) return next(err);
        if (!classroom) return next(new Error('Failed to load Classroom'));
        req.classroom = classroom;
        next();
    });
};

exports.index = function(req, res){
  res.render('classroom/index');
};

exports.new = function(req, res){

};