var express = require('express');
var ObjectId = require('mongoose').Types.ObjectId;
var Document = require('../models/document');

module.exports = (function() {
  'use strict';
  var docs = express.Router();

  function userIsLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }

  docs.get('/new', userIsLoggedIn, function(req, res) {
    res.render('new', {username: req.user.username});
  });

  docs.get('/editor/:id', userIsLoggedIn, function(req, res) {
    Document.findOne({_id: new ObjectId(req.params.id)}, function(err, doc) {
      res.render('editor', {
        title: doc.title,
        doc_id: req.params.id,
        date: doc.date,
        username: req.user.username,
        collaborators: doc.collaborators,
        owner: doc.owner,
        isOwner: (doc.owner === req.user.username)
      });
    });
  });

  docs.post('/create-doc', userIsLoggedIn, function(req, res) {
    var title = req.body.title;
    var date = new Date();
    var docObj = {title: title, date: Date.now(), owner: req.user.username, collaborators: []};
    Document.create(docObj, function(err, doc){
      if(err) console.log(err);
      else  {
        console.log(doc);
        res.redirect('/editor/' + doc._id);
      }
    });
  });

  docs.get('/docs', userIsLoggedIn, function(req, res) {
    Document.find({owner: req.user.username}, function(err, docs) {
      Document.find({collaborators: req.user.username}, function(err, shared) {
        res.render('docs', {
          docs: docs,
          shared: shared,
          username: req.user.username
        });
      });
    });
  });

  docs.get('/share/:doc_id', userIsLoggedIn, function(req, res) {
    Document.findOne({_id: new ObjectId(req.params.doc_id)}, function(err, doc) {
      res.render('share', {username: req.user.username, doc: doc});
    });
  });

  docs.post('/share-with', userIsLoggedIn, function(req, res) {
    var email = req.body.email;
    var query = {_id: new ObjectId(req.body.doc_id)};
    Document.findOneAndUpdate(query, {$push: {collaborators: email}}, {upsert:true}, function(err, doc) {
      console.log('added collaborator, redirecting.');
      res.redirect('/docs');
    });
  });

  return docs;
})();
