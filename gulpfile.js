
'use strict';

// Default Functions
let gulp    = require('gulp');
let path    = require('path');
let del     = require('del');
let seq     = require('run-sequence');
let notify  = require('gulp-notify');
let gulpif  = require('gulp-if');
let smap    = require('gulp-sourcemaps');

// compile HTML
let pug     = require('gulp-pug');

// compile CSS
let sass    = require('gulp-sass');
let pls     = require('gulp-pleeease');

// watch tasks
let watch   = require('gulp-watch');
let plumber = require('gulp-plumber');

// Browser Sync
let bsync   = require("browser-sync");

// replace
let replace = require('gulp-replace');
let minimist = require('minimist');

// env setting
let env = minimist(process.argv.slice(2));
let outputRoot;
// gulp --localでenv.localがtrueになるので、
// 出力先を変更する
if(env.local){
	outputRoot = './local/';
}
else{
	outputRoot = './dest/';
}



// 全体
gulp.task('init', () => {
	// 順次実行したいものを左から順に指定する
	if(env.local){
		return seq('clear', 'compile:pug', 'compile:js', 'compile:sass', 'copy:image');
	}
	else{
		return seq('clear', 'compile:pug', 'compile:js', 'compile:sass', 'copy:image', 'server', 'watchtower');
	}
});

//////////////////////////////////////////////////
// 以下個別タスク
//////////////////////////////////////////////////

// ==============================
// Compile Pug
//
gulp.task('compile:pug', () => {
	return gulp.src(['./src/markup/**/*.pug', '!./src/markup/**/_*.pug'], {base:'src/markup'})
		.pipe(plumber({
			errorHandler: notify.onError('Error: <%= error.message %>')
		}))
		.pipe(pug({
			pretty: true,
			basedir: './src/markup'
		}))
		.pipe(plumber.stop())
		// gulp --localでno-cacheの記載がある行を削除
		.pipe(gulpif(env.local, replace(/^.*no-cache.*\n/gm, '')))
		.pipe(gulp.dest(outputRoot));
});

// ==============================
// Image Copy
//
gulp.task('copy:image', () => {
	return gulp.src(['./src/res/*.png'], {base:'src'})
		.pipe(gulp.dest(outputRoot));
});

// ==============================
// SASS
//
gulp.task('compile:sass', ()=>{

	let sassSrc = './src/style/**/*.+(sass|scss|css)';

	return gulp.src(sassSrc)
		.pipe(plumber({
			errorHandler: notify.onError('Error: <%= error.message %>')
		}))
		.pipe(smap.init())
		.pipe(sass())
		.pipe(pls({
			autoprefixer: {browsers: [
				'> 5%',
				'last 2 versions'
			]},
			mqpacker: true,
			minifier: true
		}))
		.pipe(plumber.stop())
		.pipe(smap.write())
		.pipe(gulp.dest(outputRoot))
		.pipe(bsync.stream());
});

// ==============================
// JS
//
gulp.task('compile:js', ()=>{
	return gulp.src('./src/script/**/*.js')
		.pipe(gulp.dest(path.join(outputRoot, '/script/')));
});

// ==============================
// Item Clean
//
gulp.task('clear', function() {
	del(path.join(outputRoot, '/*'));
});

// ==============================
// Server Init
//
gulp.task('server', function() {
	return bsync.init({
		server: {
			browser: ['Google Chrome', 'firefox'],
			baseDir: './dest/'
		}
	})
})

// ==============================
// Server Reload Task
//
gulp.task('bsync:reload', ()=>{
	return bsync.reload();
});

// ==============================
// WatchTower
//
gulp.task('watchtower', ()=>{
	watch('./src/**/*.pug', () => {return seq('compile:pug','bsync:reload');});
	watch('./src/res/*.*', () => {return seq('copy:image','bsync:reload');});
	watch('./src/style/**/*.+(sass|scss|css)', () => {return seq('compile:sass');});
		watch('./src/script/*.js', () => {return seq('compile:js','bsync:reload');});
});


// ==============================
// Default TASK
//
gulp.task('default', ['init'], () => {
	console.log('Gulp started');
});





// ==============================
