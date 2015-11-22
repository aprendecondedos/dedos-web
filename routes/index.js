var express = require('express');
var router = express.Router();
var lib = require('../lib/functions');
var multer =  require('multer');
var AdmZip = require('adm-zip');
// NodeJS libs
var path =  require('path');
var fs = require('fs');

// Load model
var Project = require('./project');

// routes relacionadas con las páginas /play
router.use('/play', require('./play'));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, lib.unique_id() + Date.now() + path.extname(file.originalname))
  }
});
var upload = multer({storage: storage});


// home page
router.get('/', function (req, res, next) {
  var data = {
    title: 'Express'
  };
  res.render('index', data);
});

// Uploading files
router.post('/project/upload', upload.fields([{name: 'file_zip'}]), function (req, res, next) {

  var image_array = [],
      xml = '',
      folderName = lib.unique_id();

  var zip = new AdmZip(req.files.file_zip[0].path);
  var zipEntries = zip.getEntries(); // an array of ZipEntry records

  zipEntries.forEach(function (zipEntry) {
    if (zipEntry.isDirectory == false) {
      if (zipEntry.name.indexOf('.xml') != -1) {
        xml = zipEntry.entryName;
      } else {
        image_array.push(zipEntry.entryName);
      }
    }
  });
  // extraer todos los archivos a una ruta específica
  zip.extractAllTo('./uploads/' + folderName, true);

  // Creación de la tabla con los datos recogidos del formulario y el zip
  var project = new Project({
        name: req.body.name,
        project: folderName,
        data: xml,
        images: image_array,
        numPlayers: req.body.players
  });
    project.save(function (err) {
        if (err) // ...
            console.log('meow');

        project.setActivities();
    });

  // eliminamos el archivo comprimido
  fs.unlink('./' + req.files.file_zip[0].path);

  res.status(204).end()
});


module.exports = router
