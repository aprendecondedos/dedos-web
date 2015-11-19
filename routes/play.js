var express = require('express');
var router = express.Router();
var fs = require('fs');
var xml2js = require('xml2js');
// Load model
var Project = require('../models/project');
var Activity = require('../models/project');

router.get('/:id', function (req, res, next) {
    Project.findOne({ 'project': req.params.id }).populate('activities').exec(function(err, project) {
        // Excepcion de los errores
        if (err) return handleError(err);
        console.log(project.setActivities());
        project.activities.forEach(function(activity){
            //console.log(activity);
            //activity.setElements();
        });
        // Mostramos la vista
        res.render('play', project);
    });
  Project.findOne({ 'project': req.params.id }, function (err, project) {
    if (err) return handleError(err);
    //res.render('play', project);
    //project.activities.forEach(function(activity){
    //    console.log(activity.model);
    //});
    //  console.log(project.activities[2]);
  });
    //Activity.findOne({ _id: '564cfbfe6e90f15cb16114e3' }, function (err, act) {
    //    console.log(act);
    //});
});

module.exports = router;
