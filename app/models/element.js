var util = require('util');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ElementSchema = new Schema({
    element_id  : String,
    position: {
        x : Number,
        y : Number
    },
    size: {
      width   : Number,
      height  : Number
    }
});
/**
 * Hooks
 */
ElementSchema.pre('save', function (next) {
    next();
});

/**
 * Methods
 *
 * @type {{}}
 */
ElementSchema.methods = {

};

/**
 * Statics
 */

ElementSchema.statics = {
    /**
     * Listar elmentos y filtrarlos
     *
     * @param {Object} options
     * @api private
     */

    list: function (options) {
        const criteria = options.criteria || {};
        const page = options.page || 0;
        const limit = options.limit || 30;
        return this.find(criteria)
          .populate('tokens')
          .sort({ createdDate: -1 })
          .limit(limit)
          .skip(limit * page)
          .exec();
    }
}

mongoose.model('Element', ElementSchema);
