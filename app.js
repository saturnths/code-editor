var path = require('path');
var logger = require('morgan');
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var User = require('./models/user');
var Document = require('./models/document');
var routes = require('./routes/router');
var docs = require('./routes/docs');
var debug = require('debug')('njs');
var Duplex = require('stream').Duplex;
var browserChannel = require('browserchannel').server;
var sharejs = require('share');
var shareAce = require('share-ace');

var app = express();
app.locals.moment = require('moment');

// ShareJS:
var liveDBMongo = require('livedb-mongo');
var livedb = require('livedb');
var db = liveDBMongo('mongodb://localhost:27017/code_editor?auto_reconnect', {
  safe: true
});
var backend = livedb.client(db);

var share = sharejs.server.createClient({backend: backend});

app.use(logger('dev'));
app.use(express.static('public'));
app.use(express.static(__dirname + '/ace-builds/src-noconflict'));
app.use(express.static(shareAce.scriptsDir));
// app.use(express.static(sharejs.scriptsDir));

// Browserchannel:
app.use(browserChannel({webserver: express}, function (client) {
  var stream = new Duplex({objectMode: true});
  stream._write = function (chunk, encoding, callback) {
    if (client.state !== 'closed') {
      client.send(chunk);
    }
    callback();
  };
  stream._read = function () {};
  stream.headers = client.headers;
  stream.remoteAddress = stream.address;
  client.on('message', function (data) {
    stream.push(data);
  });
  stream.on('error', function (msg) {
    client.stop();
  });
  client.on('close', function (reason) {
    stream.emit('close');
    stream.emit('end');
    stream.end();
  });
  return share.listen(stream);
}));

// Views:
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cookieParser());
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

// Routes:
app.use('/', routes);
app.use('/', docs);

// Passport:
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect('mongodb://localhost/code_editor');

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// dev
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// prod
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {} // no stacktrace
  });
});

var port = process.env.PORT || 8000;
app.listen(port);

module.exports = app;
