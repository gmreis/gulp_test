const gulp = require('gulp');
const git = require('gulp-git');
const bump = require('gulp-bump');
const filter = require('gulp-filter');
const tagVersion = require('gulp-tag-version');

/**
 * Bumping version number and tagging the repository with it.
 * Please read http://semver.org/
 *
 * You can use the commands
 *
 *     gulp patch     # makes v0.1.0 → v0.1.1
 *     gulp feature   # makes v0.1.1 → v0.2.0
 *     gulp release   # makes v0.2.1 → v1.0.0
 *
 * To bump the version numbers accordingly after you did a patch,
 * introduced a feature or made a backwards-incompatible release.
 * @param {any} importance
 */
function incrementVersion(importance) {
    // get all the files to bump version in
    gulp.src(['./package.json'])
        // bump the version number in those files
        .pipe(bump({ type: importance }))
        // save it back to filesystem
        .pipe(gulp.dest('./'))
        // commit the changed version number
        .pipe(git.commit('New version'))
        // read only one file to get the version number
        .pipe(filter('package.json'))
        // **tag it in the repository**
        .pipe(tagVersion())
        // push local changes to repository
        .on('end', () => git.push('origin', 'master', { args: ' --tags' }, err => {
            if (err) throw err;
        }));
}

gulp.task('patch', () => incrementVersion('patch'));
gulp.task('feature', () => incrementVersion('minor'));
gulp.task('release', () => incrementVersion('major'));

const Show = (cb) => {
    console.log('Teste: Image!');
};

gulp.task('test', ['patch'] , Show());

const buildImageName = () => {
    var pkg = require('./package.json');
    const dockerRegistry = pkg.dockerRegistry;

    
    const port = dockerRegistry.port ? dockerRegistry.port : '';
    const group = dockerRegistry.group ? dockerRegistry.group : '';
    const host = dockerRegistry.host ? dockerRegistry.host : '';

    let imageName = '';
    if (host && port) {
        imageName = `${host}:${port}/`;
    } else if (host) {
        imageName = `${host}/`;
    }

    if (group) {
        imageName += `${group}/`;
    }

    imageName += `${pkg.name}:${pkg.version}`

    
    return imageName;
}

const spawn = require('child_process').spawn;
const execCommand = (cb, ...args) => {
    const exec = spawn(...args);
    exec.stdout.on('data', function (data) {
        console.log(data.toString());
    });

    exec.stderr.on('data', (data) => {
        console.log(data.toString());
    });

    exec.on('close', function (code) {
        if (code) {
            console.error('Erro ao fazer Commando');
            return;
        }

        console.log('Executado =]');

        if (cb) {
            cb(code);
        }
    });
}


const dockerBuild = (cb) => {

    const image = buildImageName();
    
    console.log('Buildando imagem' + image);

    execCommand(cb, 'docker', ['build', '.', '-t', image]);
};

const dockerPublish = (cb) => {

    const image = buildImageName();

    console.log('Publicando a imagem: ', image);


    execCommand(cb, 'docker', ['push', image]);
}

/*

const dockerBuild = (cb) => {

    const image = buildImageName();
    
    console.log('Buildando imagem' + image);

    const build = spawn('docker', ['build', '.', '-t', image]);
    build.stdout.on('data', function (data) {
        console.log(data.toString());
    });

    build.stderr.on('data', (data) => {
        console.log(data.toString());
    });

    build.on('close', function (code) {
        if (code) {
            console.error('Erro ao fazer o Build do Docker');
            return;
        }
        console.log('Imagem Buildada =]');

        if (cb) {
            cb(code);
        }
    });
}

const dockerPublish = (cb) => {

    const image = buildImageName();

    console.log('Publicando a imagem: ', image);


    const push = spawn('docker', ['push', image]);
    push.stdout.on('data', function (data) {
        console.log(data.toString());
    });

    push.stderr.on('data', (data) => {
        console.log(data.toString());
    });

    push.on('close', function (code) {
        if (code) {
            console.error('Erro ao Publicar a imagem');
            return;
        }

        console.log('Imagem publicada!!! =]');

        if (cb) {
            cb(code);
        }
    });
}
*/
gulp.task('docker-build', dockerBuild);
gulp.task('docker-publish', ['docker-build'], dockerPublish);