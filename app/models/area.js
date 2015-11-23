var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Element = mongoose.model('Element');
var extend = require('mongoose-schema-extend');

var AreaSchema = new Schema({
    prueba: String,
});

var Area = Element.discriminator('Area', AreaSchema);