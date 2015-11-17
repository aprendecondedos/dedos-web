var mongoose = require('mongoose');

var projectSchema = mongoose.Schema({
    name        : String,
    project      : String,
    data        : String,
    images        : [],
    //collar      : {type: Number, ref: 'Collar'},
    createdDate : {type: Date, default: Date.now}
});

projectSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

projectSchema.methods.verifyPassword = function(password) {
    return bcrypt.compareSync(password, this.user.password);
};

projectSchema.methods.updateUser = function(request, response){

    this.user.name = request.body.name;
    this.user.address = request.body.address;
    this.user.save();
    response.redirect('/user');
};


module.exports = mongoose.model('Project', projectSchema);