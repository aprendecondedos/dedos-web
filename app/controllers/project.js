var AdmZip = require('adm-zip');
var lib = require('../../lib/functions');
var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({async: true});

var mongoose = require('mongoose');
var Project = mongoose.model('Project');
var Activity = mongoose.model('Activity');
var Objective = mongoose.model('Objective');
var Element = mongoose.model('Element');
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
                project: project_id
            });

            parser.parseString(xml_data);
            parser.on('end', function (XML) {
                XML.Project.Activity.forEach(function(activity_data){
                    // Set activities
                    activities = [];
                    var activity = new Activity({ project_id: project.id });

                    // Set objectives
                    var objectives = [];
                    activity_data.Objectives.forEach(function(objectives_data) {
                        objectives_data.obj.forEach(function(objective_data) {
                            var objective = new Objective(objective_data.$);
                            objective.save();
                            objectives.push(objective);
                        });
                    });
                    activity.setObjectives(objectives);

                    // Set elements
                    var elements = [];
                    activity_data.Arealist.forEach(function(area_list) {
                        area_list.Area.forEach(function(area_data){
                            var area = new Area({
                                element_id  : area_data.$.id,
                                type        : area_data.$.type,
                                bg          : area_data.bg[0].$.url
                            });
                            area.save();
                            elements.push(area);

                            // Set tokens (cards)
                            var tokens = [];
                            area_data.Tokenlist.forEach(function(tokens_data){
                                if(typeof tokens_data == 'object'){
                                    tokens_data.Token.forEach(function(token_data) {
                                        //console.log(token_data);
                                        //console.log("\n");
                                        var token = new Token({
                                            element_id  : token_data.$.id,
                                            type        : area_data.$.type
                                        });
                                        token.save();
                                        // imgCard
                                        // textCard
                                        tokens.push(token);
                                        elements.push(token);
                                    });
                                    //area.setTokens(tokens);
                                }
                            });
                            //elements.push(new Area(objective_data.$));
                        });
                    });
                    activity.setElements(elements);
                    //
                    console.log(activity);
                    activity.save();
                    activities.push(activity);
                });
            });
            project.setActivities(activities);
            project.save();
            //res.redirect('/project/'+ project._id);

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
    var p = new Area({
        name: 'ejejeje',
        prueba: 'FUNCIONA'
    });
    console.log(p);
    p.setProject();

    res.render('project/show', {
        title: req.project.name,
        project: req.project
    });
};

exports.admin = function(){

};