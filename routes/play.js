var express = require('express');
var router = express.Router();
var fs = require('fs');
var xml2js = require('xml2js');
// Load model
var Project = require('../models/project');

router.get('/:id', function (req, res, next) {

  Project.findOne({ 'project': req.params.id }, function (err, project) {
    if (err) return handleError(err);
    //console.log('%s %s is a %s.', person.name.first, person.name.last, person.occupation) // Space Ghost is a talk show host.
    res.render('play', project);

    var parser = new xml2js.Parser();
    fs.readFile('uploads/'+project.project +'/'+ project.data, function(err, data) {
      parser.parseString(data, function (err, result) {
        //console.dir(result);
        //console.log(result.Project.Activity[0].Objectives[0].obj[0].$.type);
        //console.log('Done');
        //console.log(result.Project.Activity);
      });
    });

    //project.save(function (err) {
    //  activities: [
    //    {
    //
    //    }
    //  ]
    //})
    project.setActivities();
    console.log(project)

  })
});

module.exports = router;
