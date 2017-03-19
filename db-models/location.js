var mongoose = require('mongoose'),
	util = require('../util'),
    Schema = mongoose.Schema;

var Referal = new Schema({

	installAt              : util.dbValidation.str,
	sysSize                : util.dbValidation.str,
	lat                    : util.dbValidation.str,
	lng                    : util.dbValidation.str,
	testimonial            : util.dbValidation.str,
	instalationCompletedOn : util.dbValidation.str,
	annual_consumption     : util.dbValidation.str,
	dataOfInstallation     : util.dbValidation.str

});

module.exports = mongoose.model('location', Referal);