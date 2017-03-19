var mongoose = require('mongoose'),
	util = require('../util'),
    Schema = mongoose.Schema;

var Feedback = new Schema({

	
	cust_feedback  : util.dbValidation.str,
	
	vq1            : util.dbValidation.str,
	vq2            : util.dbValidation.str,
	vq3            : util.dbValidation.str,
	vq4            : util.dbValidation.str,
	vq5            : util.dbValidation.str,
	vq6            : util.dbValidation.str,
	vq7            : util.dbValidation.str,
	vq8            : util.dbValidation.str,
	
	inst_feedback  : util.dbValidation.str,

	
	iq1            : util.dbValidation.str,
	iq2            : util.dbValidation.str,
	iq3            : util.dbValidation.str,
	iq4            : util.dbValidation.str,
	iq5            : util.dbValidation.str,
	iq6            : util.dbValidation.str,
	iq7            : util.dbValidation.str,
	iq8            : util.dbValidation.str,
	
	requirement_id : util.dbValidation.str,
	
	installer_id   : util.dbValidation.str,

});

module.exports = mongoose.model('feedback', Feedback);