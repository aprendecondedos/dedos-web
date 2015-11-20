
module.exports.unique_id = function () {
  return Math.random().toString(36).substr(2, 5).toUpperCase();
};
