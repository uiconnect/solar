var mongoose = require('mongoose'),
	util = require('../util'),
    Schema = mongoose.Schema;

var Instalation = new Schema({

	design         : [Schema.Types.Mixed], 
	username       : util.dbValidation.str,
	location       : util.dbValidation.str,
					    // [{desc,img},{desc,img}...]
	payment_status : util.dbValidation.str,
	approved_on    : util.dbValidation.str,
	updated_on     : util.dbValidation.str,
	time_ln        : [Schema.Types.Mixed] 
					    //[{name,desc,st_time,ed_time,status},...]
						// name may be folowing list
						// stc_asm,panel_mount,elec_conn,inverter_inst,remote_monitor,qa_live,metering_approval
});

module.exports = mongoose.model('instalation', Instalation);