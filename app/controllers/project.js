var AdmZip = require('adm-zip');
var lib = require('../../lib/functions');
var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({async: true});

var mongoose = require('mongoose');
var Project = mongoose.model('Project');

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
            parser.parseString(xml_data);
            var project = new Project({
                name: req.body.name,
                project: project_id
            });
            project.save();
            res.redirect('/project/'+ project._id);

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
    res.render('project/show', {
        title: req.project.name,
        project: req.project
    });
};

exports.admin = function(){

};