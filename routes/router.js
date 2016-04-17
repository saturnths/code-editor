var express = require('express');
var passport = require('passport');
var User = require('../models/user');

module.exports = (function() {
  'use strict';
  var router = express.Router();


  router.get('/', function(req, res) {
    var username = req.user ? req.user.username : null;
    res.render('index', {username: username});
  });

  router.get('/login', function(req, res) {
    res.render('login', {user: req.user});
  });

  router.post('/login',
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true
    })
  );

  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  router.get('/signup', function(req, res) {
    res.render('signup', {});
  });

  router.post('/signup', function(req, res) {
    User.register(new User({username: req.body.username}), req.body.password, function(err) {
      if (err) {
        console.log('sign up error', err);
        return next(err);
      }
      console.log('user was registered');
      res.redirect('/');
    });
  });

  return router;
})();
