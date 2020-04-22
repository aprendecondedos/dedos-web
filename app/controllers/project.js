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
var xl = require('excel4node');
var LA = require('../learning_analytics/lib');

var mongoose = require('mongoose');
var Project = mongoose.model('Project');
var Activity = mongoose.model('Activity');
var Answer = mongoose.model('Answer');
var Objective = mongoose.model('Objective');
var Element = mongoose.model('Element');
var Selection = mongoose.model('Selection');
var Pair = mongoose.model('Pair');
var TokenMeter = mongoose.model('TokenMeter');
var Area = mongoose.model('Area');
var Token = mongoose.model('Token');
var User = mongoose.model('User');
var Teacher = mongoose.model('Teacher');

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
        createdBy: [req.user.id]
      });
      var prop = project_prop.properties || {};
      // Propiedades del proyecto seleccionadas
      prop.required = prop.required || false;
      prop.delayed = prop.delayed || false;
      prop.failNotAllowed = prop.failNotAllowed || false;
      prop.turns = prop.turns || false;
      project.properties = prop;
      if (prop.maxTimeout) {
        var time = prop.maxTimeout.split(':');
        // Minutos horas
        project.properties.maxTimeout = (parseInt(time[0]) * 60 + parseInt(time[1])) / 60;
      }

      var players =  project_prop.players;
      // Añadiendo los jugadores
      if (players) {
        var users = [];
        for (player in players) {
          users.push(players[player]);
        }
        project.setPlayers(users);
      }

      parser.parseString(xml_data, function(err, XML) {
        if (err) {
          res.redirect('/project/new');
        }
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
                console.log("TOKENMETER");
                console.log("AAAAAAAAY");
                var objective = new TokenMeter(objective_data.$);
                var origzones = [];
                if ((objective_data.OriginZones.length > 1) || (objective_data.OriginZones[0] != '')) {
                  objective_data.OriginZones.forEach(function(target_data) {
                    target_data.zone.forEach(function(target_data) {
                      origzones.push(target_data.$.id);
                    });
                  });
                  objective.setOriginZones(origzones);
                }
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
            console.log("AREA");
            if (typeof area_list != 'object') { return; }

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
                if (typeof tokens_data != 'object') { return; }

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
                  console.log(token);
                  if (token_data.$.type == 'img') {
                    console.log(token_data.content[0].urlList[0].url);
                    token.setUrls(token_data.content[0].urlList[0].url);
                  } else if (token_data.$.type == 'txt') {
                    token.text = token_data.content[0].text[0];
                    console.log(token.text);
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
        subjects: edu.subjects(),
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
  const answers = yield Answer.getFromActivities(project.activities, project.players);
  var answers_data = [];
  answers.forEach(function(answer) {
    if (_.isUndefined(answers_data[answer.activityData.activity])) {
      answers_data[answer.activityData.activity] = {valid: [], wrong: []};
    }
    if (answer.activityData.valid) {
      answers_data[answer.activityData.activity].valid.push(answer);
    } else {
      answers_data[answer.activityData.activity].wrong.push(answer);
    }
  });
  res.render('project/show', {
    title: project.name,
    project: project,
    answers: answers_data
  });
});

//share project

exports.share = wrap(function*(req, res) {
    var projectDef = req.project;
    var projectId = req.params.projectId;
    var email = req.params.email;
    var result = true;
    var options = {
        criteria: {
            email: email
        }
    };
  Project.load(projectId, function (err, projectCopy) {
    projectCopy._id = mongoose.Types.ObjectId();
    projectCopy.isNew = true;
    projectCopy.createdBy.pop();
    projectCopy.players = [];
    projectCopy.project = lib.unique_id();

    projectCopy.activities.forEach(function(activity,index){
      activity.project.push(projectCopy._id);
      activity.save();
    });

      Teacher.load(options, function (err, teacher) {
          if (!teacher) {
              result = false;
          } else {
              projectCopy.createdBy.push(teacher._id);
              projectCopy.save();
          }
          if (result) {
             // req.flash('success', 'Se ha compartido el proyecto con éxito');
          } else {
            //  req.flash('error', 'No existe ninguna cuenta con ese correo electrónico');
          }
          return res.redirect('/project/' + projectId);
      });
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
 *  Analíticas del proyecto con conexión al motor de Learning Analytics
 *
 * @param {Object} req
 * @param {Object} res
 */
exports.statistics = function(req, res) {
  const project = req.project;
  //LA.get('project', {type: 'timing', params: {
  //  projectId: '5721df292f01890c9a2b363e',
  //
  //}});

  res.render('project/statistics', {
    title: project.name,
    project: project,
    education: {
      levels: edu.education_levels(),
      subjects: edu.subjects()
    }
  });
};

exports.export = wrap(function*(req, res) {

  const project = req.project;
  var columnSheet2 = 1;
  var rowSheet2 = 1;
  var answers = yield Answer.getFromActivities(project.activities);
  yield Objective.populate(project.activities,'objectives', function(err, user) {
  });
  yield Element.populate(project.activities,'elements', function(err, user) {
  });

  var wb = new xl.WorkBook();
  var ws = wb.WorkSheet('globales');
  var ws2 = wb.WorkSheet('desglosados');
  //Estilo de las celdas con los resultados
  var headerStyle = wb.Style();
  headerStyle.Font.Bold();
  headerStyle.Fill.Pattern('solid');
  headerStyle.Fill.Color('CCCCCC');
  var resultStyle = wb.Style();
  resultStyle.Font.Size(12);
  resultStyle.Fill.Pattern('solid');
  resultStyle.Font.WrapText(true);
  var correctAnswerStyle = wb.Style();
  correctAnswerStyle.Font.WrapText(true);
  var answerHeaderStyle = wb.Style();
  answerHeaderStyle.Font.Bold();
  answerHeaderStyle.Font.WrapText(true);
  answerHeaderStyle.Border({
    bottom: {
      style: 'thick'
    }
  });

  project.players.forEach(function(player, index2) {
    columnSheet2 = 1;
    var playerName = ws.Cell(index2 + 2,1);
    playerName.String(player.user.name);
    playerName.Style(headerStyle);
    // Row Names hoja 2
    var playerName2 = ws2.Cell(rowSheet2 + 2,1);
    playerName2.String(player.user.name);
    playerName2.Style(headerStyle);

    project.activities.forEach(function(activity, index1) {
      // Creamos el header con el número de la actividad
      var header = ws.Cell(1, index1 + 2);
      header.String('Actividad ' + Number(index1 + 1));
      header.Style(headerStyle);
      // header actividades Hoja 2
      var header2 = ws2.Cell(rowSheet2, columnSheet2 + 1);
      header2.String('Actividad ' + Number(index1 + 1));
      header2.Style(headerStyle);

      //Vemos si la actividad se ha resuelto bien o no o no se ha completado aún.
      var playerAnswers = _.find(answers,function(answer) {
        return (String(answer.player._id) == String(player.user._id)) &&
          (String(answer.activityData.activity) == String(activity._id));
      });
      //
      // HOJA 2

      // header respuestas dadas y respuestas correctas

      /* var header4 = ws2.Cell(2, columnSheet2 + 2)
       header3.String('Respuestas correctas');*/

      var correctAnswers = activity.returnCorrectAnswers();
      if (playerAnswers) {
        playerAnswers.elements.forEach(function(element, indexanswer) {

          var data = {
            content: element.token.getContent(),
            targetContent: element.target ? element.target.getContent() : undefined,
            valid: element.valid
          };
          if (data.valid) {
            resultStyle.Fill.Color('00CC00');
          } else {
            resultStyle.Fill.Color('FF0000');
          }
          var header3 = ws2.Cell(2, columnSheet2 + 1);
          header3.String('Respuesta ' + String(indexanswer + 1));
          header3.Style(answerHeaderStyle);


          var result2 = ws2.Cell(rowSheet2 + 2, columnSheet2 + 1);
          result2.Style(resultStyle);
          if (data.targetContent) {
            result2.String(String(data.content) + ' -> ' + data.targetContent);
          } else {
            result2.String(String(data.content));
          }

          columnSheet2++;
        });

      } else {
        var header3 = ws2.Cell(rowSheet2 + 1, columnSheet2 + 1);
        header3.String('Respuesta ' + 1);
        header3.Style(answerHeaderStyle);
        var noAnswer = ws2.Cell(rowSheet2 + 2, columnSheet2 + 1);
        noAnswer.String('Sin respuesta');
        columnSheet2++;
      }
      if (correctAnswers) {
        correctAnswers.forEach(function(answer, indexcorrect) {
          var header4 = ws2.Cell(rowSheet2 + 1, columnSheet2 + 1);
          header4.Style(answerHeaderStyle);
          header4.String('Respuesta correcta ' + String(indexcorrect + 1));

          var answerCell = ws2.Cell(rowSheet2 + 2, columnSheet2 + 1);
          answerCell.Style(correctAnswerStyle);
          answerCell.String(answer);
          columnSheet2++;
        });
      }

      var result = ws.Cell(index2 + 2, index1 + 2);
      if (playerAnswers) {
        if (playerAnswers.activityData.valid) {
          resultStyle.Fill.Color('00CC00');
        } else {
          resultStyle.Fill.Color('FF0000');
        }
        result.Style(resultStyle);
        result.Bool(playerAnswers.activityData.valid);
      } else {
        result.String('No completada');
      }
    });

    rowSheet2 = rowSheet2 + 5;
  });

  wb.write(project.name + '.xlsx', res);
  res.send();
});

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
  prop.failNotAllowed = prop.failNotAllowed || false;
  prop.turns = prop.turns || false;
  project.properties = prop;
  if (prop.maxTimeout) {
    var time = prop.maxTimeout.split(':');
    // Minutoas horas
    project.properties.maxTimeout = (parseInt(time[0]) * 60 + parseInt(time[1])) / 60;
  }
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
  //req.flash('success', 'Deleted successfully');
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
