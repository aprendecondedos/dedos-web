var express = require('express');
var router = express.Router();
var multer =  require('multer');
var path =  require('path');

var fs = require('fs');  // file system
var unzip =  require('unzip');
// Load models
var Activity =  require('../models/activity');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //console.log(cb);
    //console.log(req);
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
var cpUpload = upload.fields([{ name: 'file_zip', maxCount: 1 }, { name: 'images' }]);
router.post('/project/upload', cpUpload, function(req, res, next){

  var image_array = [],
      xml = '',
      folderName = uniqueId();
  fs.createReadStream(req.files.file_zip[0].path)
      .pipe(unzip.Parse())
      .on('entry', function (entry) {
        var fileName = entry.path;
        var type = entry.type; // 'Directory' or 'File'
        var size = entry.size;
        if(type == 'File'){
          if(fileName.indexOf('.xml') != -1 ) {
           xml = fileName;
          } else {
            image_array.push(fileName);
          }
        }
        //entry.pipe(fs.createWriteStream('./uploads/'+ uniqueId()));
        //if (fileName === "this IS the file I'm looking for") {
        //  entry.pipe(fs.createWriteStream('output/path'));
        //} else {
        //  entry.autodrain();
        //}
      });
  var stream = fs.createReadStream(req.files.file_zip[0].path).pipe(unzip.Extract({ path: './uploads/'+ folderName }));
  stream.on('close', function(){
    var upload_project = new Activity({
      name: req.body.name,
      project: folderName,
      //data: req.files.xml[0].filename,
      data: xml,
      images: image_array
    });
    upload_project.save(function (err) {
      if (err) // ...
        console.log('meow');
    });
  });
  //var image_array = [];
  //req.files.images.forEach(function(value){
  //  image_array.push(value.filename);
  //});


  res.status(204).end()
});


module.exports = router;
