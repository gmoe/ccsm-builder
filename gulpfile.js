"use strict";

var gulp        = require('gulp');
var clean       = require('gulp-clean');
var frontMatter = require('gulp-front-matter');
var marked      = require('gulp-markdown');
var htmlmin     = require('gulp-htmlmin');
var sass        = require('gulp-sass');
var rename      = require('gulp-rename');
var gutil       = require('gulp-util');
var webserver   = require('gulp-webserver');
var nunjucks    = require('nunjucks');
var path        = require('path');
var through     = require('through2');
var fs          = require('fs');
var fm          = require('front-matter');
var mkd         = require('marked');

var admonitionExt  = require('./lib/nunjucks/admonition-ext.js')(nunjucks);
var codeTabsExt    = require('./lib/nunjucks/codetabs-ext.js')(nunjucks);
var conceptDemoExt = require('./lib/nunjucks/conceptdemo-ext.js')(nunjucks);
var renderSvgExt   = require('./lib/nunjucks/rendersvg-ext.js')(nunjucks);

//Overall textbook structure
var textbook = require('./book.json');

//List of all pages in sequential order; used in navigation
var pageOrder = (() => {
  var books = [];
  var re = /(\w+\/)index.json/;
  for(const index of textbook.indexes) {
    var folder = "";
    try { folder = re.exec(index)[1]; } catch(e) {}
    var content = require('./source/'+index).content;

    for(var page of content) {
      books.push( folder+page.split('.')[0]+'.html' );
    }
  }
  return books;
})();

function preProcess() {
  return through.obj(function (file, enc, cb) {
    var nun = new nunjucks.Environment(new nunjucks.FileSystemLoader('templates'));
    nun.addExtension('AdmonitionExtension', new admonitionExt());
    nun.addExtension('CodeTabsExtension', new codeTabsExt());
    nun.addExtension('ConceptDemoExtension', new conceptDemoExt());
    nun.addExtension('RenderSvgExtension', new renderSvgExt());

    var res = nun.renderString(file.contents.toString(), textbook, (error, parsed) => {
      if(error) { throw error }
      file.contents = Buffer.from(parsed, 'utf8');
      this.push(file); cb();
    });
  });
}

function applyPageMetadata() {
  return through.obj(function (file, enc, cb) {
    var data = {
      title: textbook.title,
      titleShort: textbook.titleShort,
      pageTitle: file.page.title,
      content: file.contents.toString()
    };            

    var pageindex = pageOrder.indexOf(file.relative);
    if(pageindex > 0) { data.prev = "/"+pageOrder[pageindex-1]; }
    if(pageindex < pageOrder.length-1) { data.next = "/"+pageOrder[pageindex+1]; }

    file.data = data;
    this.push(file); cb();
  });
}

function applyTocMetadata() {
  return through.obj(function (file, env, cb) {
    var json = JSON.parse(file.contents.toString());
    var out = { 
      title: textbook.title,
      titleShort: textbook.titleShort,
      pageTitle: json.title,
      toc: [] 
    };

    //Attach front-matter (titles) to each ToC entry
    const re = /(\w+\/)index.json/;
    for(const fileName of json.content) {
      var folder = "";
      try { folder = re.exec(file.relative)[1]; } catch(e) {} 

      var atts = fm(fs.readFileSync('./source/'+folder+fileName, 
        'utf8', function(err, data){ if (err) throw err }));

      out.toc.push({ 
        file: '/'+folder+fileName.split(".")[0]+".html",
        frontMatter: atts.attributes
      });
    }

    var pageindex = pageOrder.indexOf(file.relative.split(".")[0]+".html");
    if(pageindex > 0) { out.prev = "/"+pageOrder[pageindex-1]; }
    if(pageindex < pageOrder.length-1) { out.next = "/"+pageOrder[pageindex+1]; }

    //Attach related index.md for content
    var fileName = file.relative.split(".")[0]+".md";
    var atts = fm(fs.readFileSync('./source/'+fileName, 
      'utf8', function(err, data){ if (err) throw err }));
    out.content = mkd(atts.body);

    file.data = out;
    this.push(file); cb();
  });
}

function applyTemplate(templateFile) {
  return through.obj(function (file, enc, cb) {            
    var res = nunjucks.render(templateFile, file.data);
    file.contents = Buffer.from(res, 'utf8');
    this.push(file); cb();
  });
}

gulp.task('toc', () => {
  return gulp.src('./source/**/**/*.json')
    .pipe(applyTocMetadata())
    .pipe(applyTemplate('./templates/toc.html'))
    .pipe(rename({extname: '.html'}))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'));
});

gulp.task('toc:watch', () => {
  return gulp.watch(['./source/**/**/index.(md|json)', './templates/**/*.html'], 
    ['toc']);
});

gulp.task('pages', () => {
  return gulp.src(['./source/**/**/*.md', '!./source/**/**/index.md'])
    .pipe(frontMatter({ property: 'page', remove: true }))
    .pipe(preProcess())
    .pipe(marked({ gfm: true, smartypants: true }))
    .pipe(applyPageMetadata())
    .pipe(applyTemplate('./templates/page.html'))
    .pipe(rename({extname: '.html'}))
    //.pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'));
});

gulp.task('pages:watch', () => {
  gulp.watch(['./source/**/**/*.md', '!./source/**/**/index.md',
    './templates/**/*.html'], ['pages']);
});

gulp.task('sass', () => {
  return gulp.src('./templates/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./build/css'));
});

gulp.task('sass:watch', () => {
  gulp.watch('./templates/**/*.scss', ['sass']);
});

gulp.task('copy', () =>{
  gulp.src('./node_modules/font-awesome/fonts/*')
    .pipe(gulp.dest('./build/fonts/'));
  gulp.src('./node_modules/font-awesome/css/font-awesome.min.css')
    .pipe(gulp.dest('./build/css/'));
  gulp.src('./node_modules/d3/build/d3.min.js')
    .pipe(gulp.dest('./build/lib/'));
  gulp.src('./source/assets/**/*')
    .pipe(gulp.dest('./build'));
});

gulp.task('webserver', () => {
  gulp.src('build')
    .pipe(webserver({
      livereload: true
      //open: true
    }));
});

gulp.task('default', ['pages', 'sass', 'copy', 'toc']);

gulp.task('serve', ['pages:watch', 'sass:watch', 'toc:watch', 'copy', 'webserver']);
