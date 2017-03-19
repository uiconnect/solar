var path     = require('path');

var Routes = {
	init: function(router,app) {
		this.addHeaders(router,app);
		router.get('/' , this.index);
		router.get('/installer' , this.installer);
		router.get('/admin' , this.admin);

	},
	addHeaders: function (router,app) {
		router.use(function (req, res, next) {
		    res.header('Cache-Control', 'public, max-age=31536000');
		    next()
		});
	},
	index: function (req,res) {
		res.redirect("public/pages/login.html")
	},
	installer: function (req,res) {
		res.redirect("public/pages/installer_order-list.html")
	},
	admin: function (req,res) {
		res.redirect("public/pages/login.html")
	}

}

module.exports = Routes;