// This page has to be removed if it grows or complex
var user         = require('./user'),
login            = user.login,
register         = user.register,
forgetPassword   = user.forgetPassword,
forgetUsername   = user.forgetUsername,
forgorCred       = user.forgorCred,
installerLogin   = require('./installer').installerLogin,
AccessLogger     = require("./AccessLogger"),
jwt              = require('jsonwebtoken'),
tableControllers = {
	"requirement"  : require('./requirement'),
	"assessment"   : require('./assessment'),
	"company"      : require('./company'),
	"feedback"     : require('./feedback'),
	"installer"    : require('./installer'),
	"installation" : require('./installation'),
	"user"         : require('./user'),
	"location"     : require('./location'),
	"referral"     : require('./referral')
};

var accesses;
accesses = new AccessLogger(20, 10, 60, 30);
							// count, check for 10 mins, block user for 60 mins, clear interval

var Routes = {
	init: function(apiRoutes,app) {
		//this.restrictAccessBySameIp(apiRoutes,app);
		this.initPreloginRoutes(apiRoutes);
		this.authendicateFilter(apiRoutes,app);
		this.initPostloginRoutes(apiRoutes);
	},
	initPreloginRoutes: function(apiRoutes) {
		apiRoutes.post('/register', register);
		apiRoutes.post('/login', login);
		apiRoutes.post('/login', login);
		apiRoutes.post('/forgot-password', forgetPassword);
		apiRoutes.post('/forgot-credentials', forgorCred);
		apiRoutes.post('/forgot-username', forgetUsername);
		apiRoutes.post('/login-installer', installerLogin);
	},
	initPostloginRoutes: function(apiRoutes) {

		for(var item in tableControllers){
			var ctrl = tableControllers[item];
			apiRoutes.post  ('/'+ item ,               ctrl.add);
			apiRoutes.post  ('/'+ item +'/all',        ctrl.getAll); // it should be get but for safty purpose its addede as post
			apiRoutes.post  ('/'+ item +'/:id',        ctrl.getById); // it should be get but for safty purpose its addede as post
			apiRoutes.put   ('/'+ item +'/:id',        ctrl.putById);
			apiRoutes.patch ('/'+ item +'/:id',        ctrl.putById);
			apiRoutes.post  ('/'+ item +'/:id/delete', ctrl.deleteById);// it should be get but for safty purpose its addede as post
		}

	},
	restrictAccessBySameIp: function (apiRoutes,app) {

		apiRoutes.use(function(req, res, next) {
			
			var ip = req.headers['x-forwarded-for'] || 
						req.connection.remoteAddress || 
						req.socket.remoteAddress ||
						req.connection.socket.remoteAddress;

		    /*if (!accesses.check(ip)) {
		        // cancel the request here
		        res.status(500).send({ 
			        error: "You do not have access" 
			    });
		    } else {
		        next();
		    }*/

		    next();
		});
	},
	authendicateFilter: function (apiRoutes,app) {
		apiRoutes.use(function(req, res, next) {
		  // check header or url parameters or post parameters for token
		  var token = req.body.token || req.query.token || req.headers['x-access-token'];

		  // decode token
		  if (token) {

		    // verifies secret and checks exp
		    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
		      if (err) {
		        return res.json({ success: false, message: 'Failed to authenticate token.' });    
		      } else {
		        // if everything is good, save to request for use in other routes
		        req.decoded = decoded;    
		        next();
		      }
		    });

		  } else {

		    // if there is no token
		    // return an error
		    return res.status(403).send({ 
		        success: false, 
		        status:403,
		        message: 'No auth infermation provided.' 
		    });
		    
		  }
		});
	}
}

module.exports = Routes;