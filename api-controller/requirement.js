var Schema = require('../db-models/requirement');
var InstSchema = require('../db-models/installer');
var postmark = require("postmark");
var client = new postmark.Client("f6f2bddb-5ada-4de0-84bd-447effcf7457");


var util = require('../util');

 function sendThankMail(email) {
        // body...
        client.sendEmail({
            "From"     : process.env.FROM_EMAIL || "mani.vannan@uiconnect.in",
            "To"       : email,
            "Subject"  : "Eight minutes System",
            "HtmlBody" : "<p><b>Thank you!</b></p><p>Our Energy Specialists will get in touch with you within 24hours to confirm your solar consultation.</p><p>What to Expect During Home Energy Evaluation</p><p>The Evaluation typically takes about 30 minutes, whereour Energy Specialist helps you understand how solarworks and how it can help reduce your energy bill. OurSpecialists will then visit your roof and prepare a rooftoplayout to determine what System Size can be installedand the maximum energy potential of your home.</p><p>Be Prepared</p><p>Make sure there is easy access to your roofKeep the last 12 months of your electricity bill handy</p>"
        });
        console.log("Mail sent")
    }

var Controller = {
    add : function (req, res) {
        var self = this;
        Schema.count({}, function(err, size) {
             var OrderId = "8M"+((new Date()).getFullYear()-2000)+"/FE/"+req.body.installAt.split("").shift().toUpperCase()+"/"+size; 

             if(req.decoded._doc.role.toLowerCase() === "user"){
                var date = new Date();
                var newEnty = util.rmExtToUpdate(Schema,req);
                newEnty ["username"] = req.decoded._doc.username;
                newEnty ["itemname"] = date.toDateString() + " : " + date.getTime().toString(32); // TODO: 0001
                newEnty ["addedby"] = "user";
                newEnty ["orderid"] = OrderId;
                var newRecord = new Schema(newEnty);
                newRecord.save(function(e,record) {
                    sendThankMail(record.owner_email)
                    return util.apiResp(req,res,e,record)
                });
            }

            if(req.decoded._doc.role.toLowerCase() === "admin"){
                var date = new Date();
                var newEnty = util.rmExtToUpdate(Schema,req);
                newEnty ["username"] = req.body.username;
                newEnty ["addedby"] = "admin";
                newEnty ["itemname"] = date.toDateString() + " : " + date.getTime().toString(32); // TODO: 0001
                newEnty ["orderid"] = OrderId;
                var newRecord = new Schema(newEnty);
                newRecord.save(function(e,record) {
                    sendThankMail(record.owner_email)
                    return util.apiResp(req,res,e,record);
                });
            }


        });

    },
    getById: function(req, res) {
        //
        Schema.findOne({ _id: req.params.id }, function(e, record) {
            return util.apiResp(req,res,e,record)
        });
    },
    getAll: function(req, res) {
        if(req.decoded._doc.role.toLowerCase() === "user"){
            Schema.find({username:req.decoded._doc.username}, function(e, records) {
                return util.apiResp(req,res,e,records)
            });
        }
        if(req.decoded._doc.role.toLowerCase() === "admin"){

            Schema.find({}, function(e, records) {
                 InstSchema.find({}, function(e, installers) {
                    for(var i in records){
                        var record = records[i];
                        if(record.installer_id){
                            var inst = installers.filter(function (a) {
                               return a._id == record.installer_id
                            })[0]

                            record.installername = inst && inst.name
                        }
                    }
                    return util.apiResp(req,res,e,records)
                });
                //return util.apiResp(req,res,e,records)
            });
        }

        if(req.decoded._doc.role.toLowerCase() === "installer"){

            console.log(req.decoded)

            Schema.find({installer_id:req.decoded._doc.id}, function(e, records) {
                return util.apiResp(req,res,e,records)
            });
        }
    },
    putById: function (req, res) {
        Schema.findOneAndUpdate({ _id: req.params.id }, {$set:util.rmExtToUpdate(Schema,req)}, {new: true}, function(e, record){
            return util.apiResp(req,res,e,record)
        });
    },
    deleteById: function (req, res) {
        //req.params.id
        // body...
    }
}
module.exports = Controller;