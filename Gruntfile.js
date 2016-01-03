module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jscs: {
      src: "app/models/*.js",
      options: {
        config: ".jscsrc",
        esnext: true, // If you use ES6 http://jscs.info/overview.html#esnext
        verbose: true, // If you need output with rule names http://jscs.info/overview.html#verbose
        fix: true, // Autofix code style violations when possible.
        //requireCurlyBraces: [ "if" ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-jscs');

  //grunt.registerTask('default', ['jscs']);
};