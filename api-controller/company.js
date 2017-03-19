var Schema = require('../db-models/company');
var util = require('../util');
var Controller = {
	add : function (req, res) {
		if(req.decoded._doc.role.toLowerCase() === "admin"){ 
            var newEnty = util.rmExtToUpdate(Schema,req);
            var newRecord = new Schema(newEnty);
            newRecord.save(function(e,record) {
                return util.apiResp(req,res,e,record)
            });
        }
	},
	getById: function(req, res) {
		//
		Schema.findOne({ _id: req.params.id }, function(e, record) {
	        return util.apiResp(req,res,e,record)
	    });
	},
    getAll: function(req, res) {
        Schema.find({}, function(e, records) {
            return util.apiResp(req,res,e,records)
        });
    },
	putById: function (req, res) {
		Schema.findOneAndUpdate({ _id: req.params.id }, {$set:util.rmExtToUpdate(Schema,req)}, {new: true}, function(e, record){
		    return util.apiResp(req,res,e,record)
		});
	},
	deleteById: function (req, res) {
		Schema.findOneAndRemove({ _id: req.params.id }, function(e, record){
            return util.apiResp(req,res,e,record)
        });
	}
}
module.exports = Controller;