"use strict";

const gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	replace = require('gulp-replace'),
	webserver = require('gulp-webserver'),
	mocha = require('gulp-mocha'),
	install = require("gulp-install"),
	jshint = require('gulp-jshint'),
	insert = require('gulp-insert'),
	fs = require('fs');

const PACKAGE = require('./package.json');
const ATTIBUTION = "/* Version "+PACKAGE.version+" dom-node-selection-mapper (https://github.com/ecaroth/dom-node-selection-mapper), Authored by Evan Carothers (https://github.com/ecaroth) */"+"\n\n";

function _load_partials(){
	return {
		SELECTOR_JS : fs.readFileSync('./src/_selector.js'),
		MATCHER_JS: fs.readFileSync('./src/_matcher.js'),
		MAPPER_JS: fs.readFileSync('./src/_mapper.js'),
		CSSESC_JS: fs.readFileSync('./src/_cssesc.js')
	}
}

//check the npm dependencies
gulp.task('install_deps', function(){
	gulp.src('./package.json')
  		.pipe(install());
});

//build both dev & prod versions
gulp.task('build', ['build_dev','build_prod'] );

//build dev version of concatenated script
gulp.task('build_dev', ['install_deps'], function(){
	var PARTIALS = _load_partials();

	return gulp.src('./src/main.js')
		.pipe(concat('dom_node_selection_mapper.js'))
		.pipe(replace( '<<CSS_ESCAPE>>', PARTIALS.CSSESC_JS))
		.pipe(replace( '<<SELECTOR>>', PARTIALS.SELECTOR_JS))
		.pipe(replace( '<<MATCHER>>', PARTIALS.MATCHER_JS))
		.pipe(replace( '<<MAPPER>>', PARTIALS.MAPPER_JS))
		//.pipe(jshint())
  		//.pipe(jshint.reporter('default'))
  		//.pipe(jshint.reporter('fail'))
  		.pipe(insert.prepend(ATTIBUTION))
		.pipe(gulp.dest('dist'))
});

//build production version of concatendated script
gulp.task('build_prod', ['install_deps'], function(){
	var PARTIALS = _load_partials();
	//TODO add sourcemaps
	return gulp.src('./src/main.js')
		.pipe(concat('dom_node_selection_mapper.min.js'))
		.pipe(replace( '<<CSS_ESCAPE>>', PARTIALS.CSSESC_JS))
		.pipe(replace( '<<SELECTOR>>', PARTIALS.SELECTOR_JS))
		.pipe(replace( '<<MATCHER>>', PARTIALS.MATCHER_JS))
		.pipe(replace( '<<MAPPER>>', PARTIALS.MAPPER_JS))
		.pipe(jshint())
  		.pipe(jshint.reporter('default'))
  		.pipe(jshint.reporter('fail'))
		.pipe(gulp.dest('dist'))
        .pipe(uglify({mangle:false}))
        .pipe(insert.prepend(ATTIBUTION))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
	return gulp.watch('./src/*.js', ['build_dev']);
});

gulp.task('dev_webserver', ['build_dev'], function(){
	return gulp.src(['test','dist','node_modules'])
	    .pipe(webserver({
	      port: 3003
    	})
    );
});

gulp.task('test', ['build_prod','build_dev'], function(){
	return gulp.src('./test/test_suite.js', {read: false})
		.pipe(mocha({reporter:'spec'}))
		.on("error", function(err) {
	  		console.log(err.toString());
	  		this.emit('end');
	  		 process.exit();
	  	})
	    .once('end', () => {
	        process.exit();
	    });
});

gulp.task('dev', ['dev_webserver','watch'] );