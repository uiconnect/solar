var curPath = require('path');
var fs = require('fs');
var storeBlab = true;
var Util = {
	config:{
		role:{
			user: "user"
		},
		dbName:"mani-portfolio",
		seqList:[
			"__v",
			"password"
		]
	},

	formatErrMsg: function (err) {
		if(err.errmsg){
			return err.errmsg.replace(this.config.dbName,"") ;
		}
		var errors = err.errors;
		if(errors){
			for(var i in errors){
				return errors[i].message;
			}
		}
	},
	apiResp: function (req,res,err,doc) {
		// need to added filter on err and doc which is passed as respose
		if(err){
            console.log(err);
            return res.status(500).send({ 
		        error: this.formatErrMsg(err) 
		    });
        }
        return res.status(200).json(doc);
	},
	
	decodeBase64Image: function (dataString) {
	  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
	    response = {};

	  if (matches && matches.length !== 3) {
	    return new Error('Invalid input string');
	  }

	  response.type = matches[1];
	  response.data = new Buffer(matches[2], 'base64');

	  return response;
	},
	rmExtToUpdate: function (db_model,req) {
		var newEntry = {}
		var self = this;
        db_model.schema.eachPath(function(path) {
            var val = req.body[path]

            if(val !== undefined){
                newEntry[path] = val;
            }

            if((path.indexOf("_ctr_copy") != -1 ) && req.body[path]){

            	var base64Data = req.body[path].file && req.body[path].file;

            	if(base64Data.indexOf("data:")==0){
	            	var base64DataBlab = base64Data.split(",");
	            	base64DataBlab.shift();
	            	base64DataBlab = base64DataBlab.join(",");


	            	var extFilePath = ("/public/dist/doc/" + path+"-"+req.body["_id"]+"."+req.body[path].ext).toLowerCase();
	            	
	            	if(storeBlab){
	            		newEntry[path] = {
	            			file : base64Data,
	            			ext : req.body[path].ext
	            			
	            		}
	            	}else{
	            		newEntry[path].file = {
	            			file : extFilePath,
	            			ext : req.body[path].ext
	            			
	            		}
	            	}
	            	

	            	var filePath = "."+extFilePath + "";

					fs.writeFile(filePath, base64DataBlab,'base64', function(err) {
					    if(err) {
					        return console.log(err);
					    }

					    console.log("The file was saved!");
					});

            	}
            }else if(path == "design"  && req.body[path]){
        		var design = req.body[path];
        		for(var i in design){
        			var item = design[i];
            		var base64Data = item.img && item.img.file;

            		if(base64Data && base64Data.indexOf("data:")==0){

	            		var base64DataBlab = base64Data.split(",");
		            	base64DataBlab.shift();
		            	base64DataBlab = base64DataBlab.join(",");
	        			
	            		var extFilePath = ("/public/dist/doc/" + path+"-"+i+"-"+req.body["_id"]+"."+item.img.ext).toLowerCase();
	            		var filePath =  "."+extFilePath + "";


	            		if(storeBlab){
	            			newEntry[path][i].img.file = base64Data;
		            	}else{
	            			newEntry[path][i].img.file = extFilePath;
		            	}

	            		fs.writeFile(filePath, base64DataBlab,'base64', function(err) {
						    if(err) {
						        return console.log(err);
						    }

						    console.log("The file was saved!");
						});

            		}

        		}
        	}

        });



        return newEntry;
	},
	dbValidation:{
		strReqUniq : { type: String, required: true, index: { unique: true }, max : 25 },
		str         : { type: String , max : 25},
		strReq      : { type: String, required: true, max : 25 },
		strUniq     : { type: String, index: { unique: true } , max : 25},
		reqUniq     : { required: true, index: { unique: true } , max : 25}
	},
	custIdFormat: function (index) {
		return "C" + (Number(index) +1);
	}
}

module.exports = Util;