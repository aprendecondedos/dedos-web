var AdmZip = require('adm-zip');
var lib = require('../../lib/functions');
var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({async: true});

var mongoose = require('mongoose');
var Project = mongoose.model('Project');
var Activity = mongoose.model('Activity');
var Selection = mongoose.model('Selection');
var Pair = mongoose.model('Pair');
var Area = mongoose.model('Area');
var Token = mongoose.model('Token');

/**
 * Load
 */

exports.load = function (req, res, next, id){
    Project.load(id, function (err, project) {
        if (err) return next(err);
        if (!project) return next(new Error('not found'));
        req.project = project;
        next();
    });
};

exports.index = function(req, res){
    var data = {
        title: 'Inicio'
    };
    res.render('index', data);
};
//var upload = multer().single('file_zip');
var upload = lib.upload('file_zip');
exports.new = function(req, res){
    if(req.method == 'POST') {
        // Subida de archivos para creación del proyecto
        upload(req, res, function (err) {

            var xml = '',
                image_array = [],
                original_path = req.file.path,
                project_id = lib.unique_id(),
                new_path = './uploads/'+ project_id;

            // Extracción del zip
            var zip = new AdmZip(original_path);
            // Se recorre cada archivo para reconocer los objetos
            zip.getEntries().forEach(function (zipEntry) {
                if (zipEntry.isDirectory == false) {
                    if (zipEntry.name.indexOf('.xml') != -1) {
                        xml = zipEntry.entryName; // Archivo XML
                    } else {
                        image_array.push(zipEntry.entryName); // Imagenes encontradas
                    }
                }
            });
            // extraer todos los archivos a una ruta específica
            zip.extractAllTo(new_path, true);
            fs.unlink('./' + original_path);

            // Lectura del XML para la creación del proyecto
            var xml_file = new_path + "/" + xml;
            var xml_data = fs.readFileSync(xml_file);

            var project = new Project({
                name: req.body.name,
                project: project_id,
            });

            parser.parseString(xml_data);
            parser.on('error', function (err) {
                console.log(err);
            });
            parser.on('end', function (XML) {
                // Guardamos la resolución del proyecto
                project.resolution = XML.Project.resolution.pop().$;

                var activities = [];
                XML.Project.Activity.forEach(function(activity_data){
                    if(typeof activity_data != 'object') return;

                    // Set activities
                    var activity = new Activity({ project_id: project.id });

                    // Set objectives
                    var objectives = [];
                    activity_data.Objectives.forEach(function(objectives_data) {
                        if(typeof objectives_data != 'object') return;

                        objectives_data.obj.forEach(function(objective_data) {

                            if(objective_data.$.type == 'sel'){
                                var objective = new Selection(objective_data.$);
                            } else if(objective_data.$.type == 'pair'){
                                var objective = new Pair(objective_data.$);

                                // set targets
                                var targets = [];
                                objective_data.Targets.forEach(function(targets_data) {
                                    targets_data.target.forEach(function(target_data) {
                                        targets.push(target_data.$.name);
                                    });
                                });
                                objective.setTargets(targets);
                            }
                            //var objective = new Objective(objective_data.$);
                            if(objective) {
                                objective.save();
                                objectives.push(objective);
                            }
                        });
                    });
                    activity.setObjectives(objectives);

                    // Set elements
                    var elements = [];
                    activity_data.Arealist.forEach(function(area_list) {
                        if(typeof area_list != 'object') return;

                        area_list.Area.forEach(function(area_data){
                            var area = new Area({
                                element_id  : area_data.$.id,
                                type        : area_data.$.type,
                                position: area_data.pos.pop().$,
                                bg          : area_data.bg.pop().$.url
                            });
                            area.save();
                            elements.push(area);

                            // Set tokens (cards)
                            area_data.Tokenlist.forEach(function(tokens_data){
                                if(typeof tokens_data != 'object') return;

                                tokens_data.Token.forEach(function(token_data) {
                                    var token = new Token({
                                        element_id  : token_data.$.id,
                                        type: token_data.$.type,
                                        position: token_data.pos.pop().$,
                                        clickable: token_data.clickable.pop(),
                                        rotatable: token_data.rotatable.pop(),
                                        resizable: token_data.resizable.pop(),
                                        movable: token_data.movable.pop(),
                                        feedback: token_data.content[0].feedback.pop()
                                    });

                                    if(token_data.$.type == 'img') {
                                        token.setUrls(token_data.content[0].urlList[0].url);
                                    } else if(token_data.$.type == 'txt') {
                                        token.text = token_data.content[0].text[0]
                                    }
                                    token.save();
                                    elements.push(token);
                                });
                            });
                        });
                    });
                    activity.setElements(elements);

                    activity.save();
                    activities.push(activity);
                });
                project.setActivities(activities);
                project.save();

                // Redireccionar al proyecto
                res.redirect('/project/'+ project._id);
            });

        });

    } else {
        var data = {};
        return res.render('project/new', data);
    }
};

/**
 * Show
 */

exports.show = function (req, res){

    var activities = req.project.activities;
    activities.forEach(function(act) {
        //var p = Activity.load(act._id);
        Activity.load(act._id, function (err, activity) {
            console.log(activity.elements);
        });

    });
    res.render('project/show', {
        title: req.project.name,
        project: req.project,
        activities: activities
    });
};

exports.admin = function(){

};