#!/bin/env node

// Set up app and DB objects
var express    = require('express');
var stylus     = require('stylus');
var fs         = require('fs');
var FsProvider = require('./farmstand-mongodb.js').FarmstandProvider;

// Create "express" server.
var express = require("express");
var app     = express();

// Set up the DB
var fsProv = new FsProvider(process.env.OPENSHIFT_NOSQL_DB_HOST,
                            parseInt(process.env.OPENSHIFT_NOSQL_DB_PORT),
                            process.env.OPENSHIFT_NOSQL_DB_USERNAME,
                            process.env.OPENSHIFT_NOSQL_DB_PASSWORD);

// Set up the app environment
app.configure(function(){
  app.set('views', process.env.OPENSHIFT_REPO_DIR + 'views');
  app.set('view engine', 'jade');
  app.set('view options', { pretty: true });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(stylus.middleware({
      src:  process.env.OPENSHIFT_REPO_DIR + 'views'  // .styl files are located in `views/stylesheets`
    , dest: process.env.OPENSHIFT_REPO_DIR + 'public' // .styl resources are compiled `/stylesheets/*.css`
    , compile: function(str, path) { // optional, but recommended
	return stylus(str)
	    .set('filename', path)
	    .set('warn', true)
	    .set('compress', true);
    }
  }));
  app.use(express.static(process.env.OPENSHIFT_REPO_DIR + 'public'));
});


/*  =====================================================================  */
/*  Setup route handlers.  */
/*  =====================================================================  */

// Handler for GET /
app.get('/', function(req, res) {
    res.render('index', { layout: 'layout', title: 'Farmstands' });
});

// Handler for GET /locations.json
app.get('/locations.json', function(req, res) {
    var sType = req.query.t;
    var qVal  = req.query.q;
    fsProv.findByState(qVal, function(error, docs) {
	if (error) {
	    console.log(error);
	}
	else {
	    res.send(docs);
	}
    });
});

// Handler for POST /locations.json
app.post('/locations.json', function(req, res) {
    var newLoc = req.body;
    fsProv.saveLoc(newLoc, function(error, docs) {
        if (error) {
            console.log(error);
        }
        else {
            res.send(docs);
        }
    });
});

// Handler for GET /states.json
app.get('/states.json', function(req, res) {
    fsProv.allStates( function(error, docs) {
        if (error) {
            console.log(error);
        }
        else {
            res.send(docs);
        }
    });
});

// Handler for GET /stategeo.json
app.get('/stategeo.json', function(req, res) {
    fsProv.allStateGeo( function(error, docs) {
        if (error) {
            console.log(error);
        }
        else {
            res.send(docs);
        }
    });
});

// Handler for POST /stategeo.json
app.post('/stategeo.json', function(req, res) {
    var newGeo = req.body;
    fsProv.setStateGeo(newGeo, function(error, docs) {
        if (error) {
            console.log(error);
        }
        else {
            res.send(docs);
        }
    });
});

// Handler for POST /locgeo.json
app.post('/locgeo.json', function(req, res) {
    var locGeo      = req.body;
    fsProv.setLocGeo(locGeo, function(error, docs) {
        if (error) {
            console.log(error);
        }
        else {
            res.send(docs);
        }
    });
});

//  Get the environment variables we need.
var ipaddr  = process.env.OPENSHIFT_INTERNAL_IP;
var port    = process.env.OPENSHIFT_INTERNAL_PORT || 8080;

if (typeof ipaddr === "undefined") {
   console.warn('No OPENSHIFT_INTERNAL_IP environment variable');
}

//  terminator === the termination handler.
function terminator(sig) {
   if (typeof sig === "string") {
      console.log('%s: Received %s - terminating Node server ...',
                  Date(Date.now()), sig);
      process.exit(1);
   }
   console.log('%s: Node server stopped.', Date(Date.now()) );
}

//  Process on exit and signals.
process.on('exit', function() { terminator(); });

['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'
].forEach(function(element, index, array) {
    process.on(element, function() { terminator(element); });
});

//  And start the app on that interface (and port).
app.listen(port, ipaddr, function() {
   console.log('%s: Node server started on %s:%d ...', Date(Date.now() ),
               ipaddr, port);
});
