var AdmZip = require('adm-zip');
var lib = require('../../lib/functions');
var edu = require('../../lib/education');
var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({async: true});
var gettext = require('../../i18n/i18n').gettext;
var extend = require('util')._extend;
var wrap = require('co-express');
var _ = require('underscore');

var mongoose = require('mongoose');
var Project = mongoose.model('Project');
var Activity = mongoose.model('Activity');
var Answer = mongoose.model('Answer');
var Selection = mongoose.model('Selection');
var Pair = mongoose.model('Pair');
var TokenMeter = mongoose.model('TokenMeter');
var Area = mongoose.model('Area');
var Token = mongoose.model('Token');

/**
 * Load
 */

exports.load = wrap(function*(req, res, next, id) {
  req.project = yield Project.load(id);
  if (!req.project) { return next(new Error('not found')); }
  next();
});

exports.index = function(req, res) {
  var data = {
    title: 'Inicio'
  };
  res.render('index', data);
};
//var upload = multer().single('file_zip');
exports.new = wrap(function*(req, res) {
  if (req.method == 'POST') {
    var project_prop = req.body;
    var upload = lib.upload('file_upload');
    // Subida de archivos para creación del proyecto
    upload(req, res, function(err) {
      var xml = '';
      var image_array = [];
      var screenshots_array = [];
      var original_path = req.file.path;
      var project_id = lib.unique_id();
      var new_path = './public/uploads/' + project_id;

      // Extracción del zip
      var zip = new AdmZip(original_path);
      // Se recorre cada archivo para reconocer los objetos
      zip.getEntries().forEach(function(zipEntry) {
        if (zipEntry.isDirectory == false) {
          if (zipEntry.name.indexOf('.xml') != -1) {
            xml = zipEntry.entryName; // Archivo XML
          } else if (zipEntry.entryName.indexOf('/screenshots/') != -1) {
            screenshots_array.push(zipEntry.name);
          } else {
            image_array.push(zipEntry.entryName); // Imagenes encontradas
          }
        }
      });

      // extraer todos los archivos a una ruta específica
      zip.extractAllTo(new_path, true);
      fs.unlink('./' + original_path);

      // Lectura del XML para la creación del proyecto
      var xml_file = new_path + '/' + xml;
      var xml_data = fs.readFileSync(xml_file);

      var project = new Project({
        name: project_prop.name,
        description: project_prop.description,
        educationLevel: project_prop.educationLevel,
        subjects: project_prop.subjects,
        project: project_id,
        screenshots: screenshots_array,
        path: '/uploads/' + project_id + '/' + xml.split('/')[0],
        createdBy: req.user.id
      });
      var players =  project_prop.players;
      // Añadiendo los jugadores
      if (players) {
        var users = [];
        for (player in players) {
          users.push(players[player]);
        }
        project.setPlayers(users);
      }
console.log(project);
      parser.parseString(xml_data);
      parser.on('error', function(err) {
        console.log(err);
      });
      parser.on('end', function(XML) {
        // Guardamos la resolución del proyecto
        project.resolution = XML.Project.resolution.pop().$;

        var activities = [];
        XML.Project.Activity.forEach(function(activity_data) {
          if (typeof activity_data != 'object') { return; }

          // Set activities
          var activity = new Activity({project: project.id});

          // Set objectives
          var objectives = [];
          activity_data.Objectives.forEach(function(objectives_data) {
            if (typeof objectives_data != 'object') { return; }

            objectives_data.obj.forEach(function(objective_data) {

              if (objective_data.$.type == 'sel') {
                var objective = new Selection(objective_data.$);
              } else if (objective_data.$.type == 'pair') {
                var objective = new Pair(objective_data.$);

                // set targets
                var targets = [];
                objective_data.Targets.forEach(function(targets_data) {
                  targets_data.target.forEach(function(target_data) {
                    targets.push(target_data.$.name);
                  });
                });
                objective.setTargets(targets);
              } else if (objective_data.$.type == 'tokenMeter') {
                var objective = new TokenMeter(objective_data.$);
                var origzones = [];
                if (objective_data.OriginZones) {
                  objective_data.OriginZones.forEach(function(target_data) {
                    target_data.zone.forEach(function(target_data) {
                      origzones.push(target_data.$.id);
                    });
                  });
                  objective.setOriginZones(origzones);
                }

                console.log(objective_data);
                console.log(objective_data.OriginTokens);
                if (objective_data.OriginTokens) {
                  var origtokens = [];
                  objective_data.OriginTokens.forEach(function(target_data) {
                    if (target_data.tok) {
                      target_data.tok.forEach(function(target_data) {
                        origtokens.push(target_data.$.id);
                      });
                    }
                  });
                  objective.setOriginTokens(origtokens);
                }

              }
              //var objective = new Objective(objective_data.$);
              if (objective) {
                objective.activity = activity._id;
                objective.save();
                objectives.push(objective);
              }
            });
          });
          activity.setObjectives(objectives);

          // Set elements
          var elements = [];
          activity_data.Arealist.forEach(function(area_list) {
            if (typeof area_list != 'object') return;

            area_list.Area.forEach(function(area_data) {
              var area = new Area({
                element_id: area_data.$.id,
                type: area_data.$.type,
                position: area_data.pos.pop().$,
                size: area_data.size.pop().$,
                bg: area_data.bg.pop().$.url
              });

              // Set tokens (cards)
              var tokens = [];
              area_data.Tokenlist.forEach(function(tokens_data) {
                if (typeof tokens_data != 'object') return;

                tokens_data.Token.forEach(function(token_data) {
                  var token = new Token({
                    element_id: token_data.$.id,
                    type: token_data.$.type,
                    value: token_data.$.numValue,
                    position: token_data.pos.pop().$,
                    size: token_data.size.pop().$,
                    clickable: token_data.clickable.pop(),
                    rotatable: token_data.rotatable.pop(),
                    resizable: token_data.resizable.pop(),
                    movable: token_data.movable.pop(),
                    feedback: token_data.content[0].feedback.pop()
                  });

                  if (token_data.$.type == 'img') {
                    token.setUrls(token_data.content[0].urlList[0].url);
                  } else if (token_data.$.type == 'txt') {
                    token.text = token_data.content[0].text[0];
                  }
                  token.activity = activity._id;
                  token.save();
                  tokens.push(token);
                  elements.push(token);
                });
              });
              area.setTokens(tokens);
              area.activity = activity._id;
              area.save();
              elements.push(area);
            });
          });

          activity.setElements(elements);
          activity.save();
          activities.push(activity);
        });

        project.setActivities(activities);
        project.save();
        // Redireccionar al proyecto
        res.redirect('/project/' + project._id);
      });

    });

  } else {
    res.render('project/new', {
      title: gettext('project:new'),
      project: new Project(),
      education: {
        levels: edu.education_levels(),
        subjects: edu.subjects()
      }
    });
  }
});

/**
 * Show
 */
exports.show = wrap(function*(req, res) {
  const project = req.project;
  // Respuestas ordenadas por actividad y valido o incorrecto
  const answers = yield Answer.getFromActivities(project.activities);
  var answers_data = [];
  answers.forEach(function(answer) {
    if (_.isUndefined(answers_data[answer.activity])) {
      answers_data[answer.activity] = {valid: [], wrong: []};
    }
    if (answer.valid && answers_data[answer.activity]) {
      answers_data[answer.activity].valid.push(answer);
    } else {
      answers_data[answer.activity].wrong.push(answer);
    }
  });
  res.render('project/show', {
    title: project.name,
    project: project,
    answers: answers_data
  });
});

/**
 *  Configuración de las propiedades del proyecto
 *
 * @param {Object} req
 * @param {Object} res
 */
exports.settings = function(req, res) {
  const project = req.project;

  res.render('project/settings', {
    title: project.name,
    project: project,
    education: {
      levels: edu.education_levels(),
      subjects: edu.subjects()
    }
  });
};

/**
 *  Edición de las propiedades del proyecto
 *
 * @param {Object} req
 * @param {Object} res
 */
exports.update = function(req, res) {
  var project = req.project;
  var players = req.body.players;
  if (players) {
    var users = [];
    for (player in players) {
      users.push(players[player]);
    }
    project.setPlayers(users);
  }
  delete req.body.players;
  delete req.body.players_name;
  delete req.body.file_upload;
  delete req.body.classroom;
  project = extend(project, req.body);
  var prop = req.body.properties || {};
  // Propiedades del proyecto seleccionadas
  prop.required = prop.required || false;
  prop.delayed = prop.delayed || false;
  prop.failAllowed = prop.failAllowed || false;
  project.properties = prop;
  project.save();

  res.redirect('/project/' + project.id + '/settings');

};

/**
 * Mostrar listado de proyectos creado por el usuario
 *
 * @param {Object} req
 * @param {Object} res
 */
exports.my = wrap(function*(req, res) {
  var options = {
    criteria: {
      createdBy: req.user.id
    }
  };
  const projects = yield Project.list(options);

  res.render('project/index', {
    title: gettext('projects:my'),
    projects: projects
  });
});

/**
 * Eliminar proyecto
 *
 * @param {Object} req
 * @param {Object} res
 */
exports.destroy = wrap(function*(req, res) {
  yield req.project.remove();
  req.flash('success', 'Deleted successfully');
  res.redirect('/projects/my');
});

/**
 * Copiar/Clonar proyecto
 *
 * @param {Object} req
 * @param {Object} res
 */
// @TODO implementar metodos para clonar todas las referencias incluidas
exports.copy = wrap(function*(req, res) {
  //yield Project.clone().save();
  var project = req.project;
  project._id = mongoose.Types.ObjectId();
  project.isNew = true;
  yield project.save();
  res.redirect('/projects/my');
});
