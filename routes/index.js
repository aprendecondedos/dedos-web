var express = require('express');
var router = express.Router();
var multer =  require('multer');
var path =  require('path');
var AdmZip = require('adm-zip');
var fs = require('fs');  // file system

var unzip =  require('unzip');
// Load models
var Project =  require('../models/project');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, uniqueId() + Date.now() +path.extname(file.originalname))
  }
});
var upload = multer({ storage: storage });

var uniqueId = function() {
  return Math.random().toString(36).substr(2, 5).toUpperCase();
};


/* GET home page. */
router.get('/', function(req, res, next) {
  var data = {
    title: 'Express'
  };
  res.render('index', data);
});

// Uploading files
var cpUpload = upload.fields([{ name: 'file_zip'}]);
router.post('/project/upload', cpUpload, function(req, res, next){

  var image_array = [],
      xml = '',
      folderName = uniqueId();

  var zip = new AdmZip(req.files.file_zip[0].path);
  var zipEntries = zip.getEntries(); // an array of ZipEntry records

  zipEntries.forEach(function(zipEntry) {
    if (zipEntry.isDirectory == false) {
      console.log(zipEntry.toString());
      if(zipEntry.name.indexOf('.xml') != -1 ) {
        xml = zipEntry.entryName;
      } else {
        image_array.push(zipEntry.entryName);
      }
    }
  });
  zip.extractAllTo('./uploads/'+ folderName, true);
  var project = new Project({
    name: req.body.name,
    project: folderName,
    data: xml,
    images: image_array
  });
  project.save(function (err) {
    if (err) // ...
      console.log('meow');
  });

  fs.unlink('./'+req.files.file_zip[0].path);
  res.status(204).end()
});


module.exports = router;
