var mongoose = require('mongoose');

var activitySchema = mongoose.Schema({
    name        : String,
    project      : String,
    data        : String,
    images        : [],
    //collar      : {type: Number, ref: 'Collar'},
    createdDate : {type: Date, default: Date.now}
});

activitySchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

activitySchema.methods.verifyPassword = function(password) {
    return bcrypt.compareSync(password, this.user.password);
};

activitySchema.methods.updateUser = function(request, response){

    this.user.name = request.body.name;
    this.user.address = request.body.address;
    this.user.save();
    response.redirect('/user');
};


module.exports = mongoose.model('Activity', activitySchema);