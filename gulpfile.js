var gulp        = require('gulp');
var frontMatter = require('gulp-front-matter');
var marked      = require('gulp-markdown');
var sass        = require('gulp-sass');
var rename      = require('gulp-rename');
var clean       = require('gulp-clean');
var gutil       = require('gulp-util');
var webserver   = require('gulp-webserver');
var nunjucks    = require('nunjucks');
var path        = require('path');
var through     = require('through2');
var vm          = require('vm');

var svgExt = require('./lib/nunjucks/rendersvg-ext.js')(nunjucks);
var conceptDemoExt = require('./lib/nunjucks/conceptdemo-ext.js')(nunjucks);

var textbook = require('./book.json'); //Overall textbook structure
var pageOrder = calcPageOrder(); //List of all pages in sequential order, used in navigation
var toc = calcTableOfContents();

function calcPageOrder() {
  var books = [];
  var re = /(\w+\/)index.json/;
  for(const index of textbook.indexes) {
    var folder = "";
    try {
      folder = re.exec(index)[1];
    } catch(e) {}
    var content = require('./source/'+index).content;

    for(var page of content) {
      books.push( folder+page.split('.')[0]+'.html' );
    }
  }

  return books;
}

function calcTableOfContents() {
  var toc = [];
  var re = /(w+\/)index.json/;
  for(const index of textbook.indexes) {
    var folder = "";
    try {
      folder = re.exec(index)[1];
    } catch(e) {}
    toc.push(require('./source/'+index)); 
  }
  console.log(toc);
}

function preProcess() {
  return through.obj(function (file, enc, cb) {
    var nun = new nunjucks.Environment(new nunjucks.FileSystemLoader('templates'));
    nun.addExtension('RenderSvgExtension', new svgExt());
    nun.addExtension('ConceptDemoExtension', new conceptDemoExt());
    var res = nun.renderString(file.contents.toString(), textbook);
    file.contents = new Buffer(res, 'utf8');
    this.push(file);
    cb();
  });
}

function applyMetadata() {
  return through.obj(function (file, enc, cb) {
  });
}

function applyTemplate(templateFile) {
  return through.obj(function (file, enc, cb) {            

    var data = {
      title: textbook.title,
      titleShort: textbook.titleShort,
      pageTitle: file.page.title,
      content: file.contents.toString()
    };            

    var pageIndex = pageOrder.indexOf(file.relative);
    if(pageIndex > 0) {
      data.prev = "/"+pageOrder[pageIndex-1];
    }
    if(pageIndex < pageOrder.length-1) {
      data.next = "/"+pageOrder[pageIndex+1];
    }

    var res = nunjucks.render(templateFile, data);
    file.contents = new Buffer(res, 'utf8');
    this.push(file);
    cb();
  });
}

gulp.task('toc', function() {
  return gulp.src('./source/**/**/*.json')
    .pipe(buildIndex('./templates/toc.html'))
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest('build'));
});

gulp.task('pages', function () {
  return gulp.src('./source/**/**/*.md')
    .pipe(frontMatter({
      property: 'page',
      remove: true
    }))
    .pipe(preProcess())
    .pipe(marked({
      gfm: true,
      smartypants: true 
    }))
    .pipe(applyTemplate('./templates/page.html'))
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest('build'));
});

gulp.task('pages:watch', function () {
  gulp.watch(['./source/**/**/*.md', './templates/**/*.html'], ['pages']);
});

gulp.task('sass', function () {
  return gulp.src('./templates/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./build/css'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./templates/**/*.scss', ['sass']);
});

gulp.task('copy', function () {
  gulp.src('./node_modules/font-awesome/fonts/*')
    .pipe(gulp.dest('./build/fonts/'));
  gulp.src('./node_modules/font-awesome/css/font-awesome.min.css')
    .pipe(gulp.dest('./build/css/'));
  gulp.src('./node_modules/d3/build/d3.min.js')
    .pipe(gulp.dest('./build/lib/'));
  gulp.src('./source/assets/**/*')
    .pipe(gulp.dest('./build'));
});

gulp.task('webserver', function() {
  gulp.src('build')
    .pipe(webserver({
      livereload: true,
      open: true
    }));
});

gulp.task('default', ['pages', 'sass', 'copy']);

gulp.task('serve', ['pages:watch', 'sass:watch', 'copy', 'webserver']);
