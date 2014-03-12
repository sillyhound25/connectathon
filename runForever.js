var forever = require('forever-monitor');

var max_restarts = 10000;

var child = new (forever.Monitor)('app.js', {
    max: max_restarts,
    silent: false,
    options: []
});

child.on('restart', function () {
    console.log('------------ app re-started ------------');
});

child.on('exit', function () {
    console.log('============ app stopped after ' + max_restarts + ' restarts ===========');
});

child.start();