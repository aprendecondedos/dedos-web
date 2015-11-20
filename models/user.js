var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// User model
var userSchema = mongoose.Schema({
    createdDate     : {type: Date, default: Date.now},
    name            : String,
    avatar          : String,
    type            : String,
    // Student properties
    projects       : [{type: Schema.Types.ObjectId, ref: 'Project'}],
    createdBy      : {type: Schema.Types.ObjectId, ref: 'User'},
    // Teacher properties
    email          : String,
    password       : String,
    classes        : [{type: Schema.Types.ObjectId, ref: 'Class'}],
});
//var User  = mongoose.model('User', userSchema);
var userSchemas = function(){
    var schema = mongoose.Schema({
        name            : String,
        avatar          : String,
        projects        : [{type: Schema.Types.ObjectId, ref: 'Project'}],
        createdDate     : {type: Date, default: Date.now}
    });
    //schema.setAsStudent();
    return schema;
};
function BaseSchema(){
    Schema.apply(this, arguments);
    this.add({
        name            : String,
        avatar          : String,
        projects        : [{type: Schema.Types.ObjectId, ref: 'Project'}],
        createdDate     : {type: Date, default: Date.now}
    });
}
var userSchemass = function(){
    var schema = mongoose.Schema({
        name            : String,
        avatar          : String,
        projects        : [{type: Schema.Types.ObjectId, ref: 'Project'}],
        createdDate     : {type: Date, default: Date.now}
    });

    return schema;
};
userSchema.methods.setAsTeacher = function() {
    this.type = 'teacher';
};
userSchema.methods.setAsStudent = function() {
    //userSchema.add({
    //    student: String
    //});
    //this.student = 'pepe';
    this.type = 'student';
    //this.createdBy: 'ID_teacher'
    console.log(this);
    return this;
};

module.exports = mongoose.model('User', userSchema);