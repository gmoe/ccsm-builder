'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var kramed = require('kramed');

module.exports = (options) => {
 return through.obj((file, enc, cb) => {
  if (file.isNull()) { cb(null, file); return; }
  if (file.isStream()) {
    var error = new gutil.PluginError({
      plugin: 'gulp-kramed',
      message: 'Streaming not supported'
    });
    return cb(error);
  }

  kramed(file.contents.toString(), options, (err, data) => {
    if (err) {
      var error = new gutil.pluginError({
        plugin: 'gulp-kramed',
        fileName: file.path
      });
      return cb(error);
    }

    file.contents = new Buffer(data);

    cb(null, file);
  });
 });
};
