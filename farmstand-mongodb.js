// Set up our DB API globals.
var Db         = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server     = require('mongodb').Server;
var BSON       = require('mongodb').BSON;
var ObjectID   = require('mongodb').ObjectID;

// Main DB provider object
FarmstandProvider = function(host, port, user, pass) {
    this.db = new Db(process.env.OPENSHIFT_APP_NAME, new Server(host, port, { auto_reconnect: true }, {}));
    this.db.open(function(error, db){
        db.authenticate(user, pass, function(error, result) {});
    });
};

// This gets us in the to 'locations' collection, which is where
// the farmstand records live.
FarmstandProvider.prototype.getLocations = function(callback) {
    this.db.collection('locations', function(error, location_collection) {
	if (error) {
	    callback(error);
	}
	else {
	    callback(null, location_collection);
	}
    });
};

// This gets us in the to 'state_geocodes' collection, which is where
// the state geocode records live. We use these to tell Google Maps
// how to center the viewport around a given state, and at what zoom level.
FarmstandProvider.prototype.getStateGeos = function(callback) {
    this.db.collection('state_geocodes', function(error, state_geocodes_collection) {
	if (error) {
	    callback(error);
	}
	else {
	    callback(null, state_geocodes_collection);
	}
    });
};

// Grab all of the farmstands for a given state.
// This also explicitly orders the records by market name.
FarmstandProvider.prototype.findByState = function(state, callback) {
    this.getLocations(function(error, location_collection) {
	if (error) {
	    callback(error);
	}
	else {
	    var cursor = location_collection.find({ 'LocAddState': state });
            cursor.sort({ 'MktName': 1 });
            cursor.toArray(function(error, result) {
		if (error) {
		    callback(error);
		}
		else {
		    callback(null, result);
		}
	    });
	}
    });
};

// Grab all of the distinct state names in the database.
// We use this to populate the UI state select list.
FarmstandProvider.prototype.allStates = function(callback) {
    this.getLocations(function(error, location_collection) {
	if (error) {
	    callback(error);
	}
	else {
            location_collection.distinct('LocAddState', function(error, result) {
		if (error) {
		    callback(error);
		}
		else {
		    callback(null, result);
		}
	    });
	}
    });
};

// Write the suppiled records into the database.
// This is for new records only, not "upserts"
FarmstandProvider.prototype.saveLoc = function(location, callback) {
    this.getLocations(function(error, location_collection) {
	if (error) {
	    callback(error);
	}
	else {
	    location_collection.insert(location, function(error, result) {
		if (error) {
		    callback(error);
		}
		else {
		    callback(null, result);
		}
	    });
	}
    });
};

// Update the indicated farmstand record with Lat/Lon data.
FarmstandProvider.prototype.setLocGeo = function(locGeo, callback) {
    this.getLocations(function(error, location_collection) {
	if (error) {
	    callback(error);
	}
	else {
	    var oid = new ObjectID(locGeo.id);
	    location_collection.update({ _id: oid }, { $set: { 'LocLat': locGeo.lat, 'LocLon': locGeo.lon }}, {}, function(error, result) {
		if (error) {
		    callback(error);
		}
		else {
		    callback(null, result);
		}
	    });
	}
    });
};

// Get the previously stored state geolocation data.
FarmstandProvider.prototype.allStateGeo = function(callback) {
    this.getStateGeos(function(error, state_geocode_collection) {
	if (error) {
	    callback(error);
	}
	else {
	    var cursor = state_geocode_collection.find({});
            cursor.toArray(function(error, result) {
		if (error) {
		    callback(error);
		}
		else {
		    callback(null, result);
		}
	    });
	}
    });
};

// Write the suppiled records into the database.
FarmstandProvider.prototype.setStateGeo = function(state, callback) {
    this.getStateGeos(function(error, state_geocode_collection) {
	if (error) {
	    callback(error);
	}
	else {
	    state_geocode_collection.insert(state, function(error, result) {
		if (error) {
		    callback(error);
		}
		else {
		    callback(null, result);
		}
	    });
	}
    });
};

// Export the DB provider for use in other modules.
exports.FarmstandProvider = FarmstandProvider;
