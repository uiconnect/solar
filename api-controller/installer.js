var jwt    = require('jsonwebtoken');
var util = require('../util');
 bcrypt           = require('bcrypt-nodejs');
    SALT_WORK_FACTOR = 10;
var Schema = require('../db-models/installer');
var CompanySchema = require('../db-models/company');
var postmark = require("postmark");
var client = new postmark.Client("f6f2bddb-5ada-4de0-84bd-447effcf7457");


var randomString = function (len, bits)
{
    bits = bits || 36;
    var outStr = "", newStr;
    while (outStr.length < len)
    {
        newStr = Math.random().toString(bits).slice(2);
        outStr += newStr.slice(0, Math.min(newStr.length, (len - outStr.length)));
    }
    return outStr.toUpperCase();
};

var Controller = {
    installerLogin:function (req,res) {
        Schema.findOne({ email: req.body.email }, function(e, record) {
            console.log(e,record,req.body.email)
            if (e || !record) {
                return res.status(500).send();
            }
            
            if(req.body.sendPassword && req.body.sendPassword!="false"){
                console.log(req.body.sendPassword)
                var password = randomString(8, 32);

                record.passHash(password,function (hash) {

                    console.log("process.env.FROM_EMAIL",process.env.FROM_EMAIL)

                    var data = {password:hash};
                    Schema.findOneAndUpdate({ email: req.body.email }, {$set:data}, {new: true}, function(e, record){
                         if(!e){
                            client.sendEmail({
                                "From"     : process.env.FROM_EMAIL || "mani.vannan@uiconnect.in",
                                "To"       : record && record.email,
                                "Subject"  : "Eight minutes System",
                                "TextBody" : ('Your password is ' + (record && password))
                            });
                            
                            return res.status(200).json({
                                "success" : "true",
                                "message" : "Please follow the instrection which sent to your email"
                            });

                        }                    

                        return util.apiResp(req,res,e,record)
                    });


                });

            }else{
                // test a matching password
                record.comparePassword(req.body.password, function(e, isMatch) {
                    if (e || !isMatch) {
                        console.log("e,isMatch",e,isMatch);
                        return res.status(500).send();
                    }

                    var recordDetails = {
                        _doc : {
                            email      : record.email,
                            location   : record.location,
                            phone      : record.phone,
                            name       : record.name,
                            id         : record._id,
                            role       : "installer",
                            company_id : record.company_id
                        }
                    };

                    var token = jwt.sign(recordDetails, req.app.get('superSecret'), {
                      expiresIn : 60*80*10000000 //expires in 80 min
                    });
                    var resData = {
                      success : true,
                      message : 'Enjoy your token!',
                      token   : token,
                      role    : "installer"
                    }
                    
                    if(req.body.newPassword && req.body.newPassword!="false"){

                        var password = req.body.newPassword;
                        record.passHash(password,function (hash) {
                            var data = {password:hash};
                            Schema.findOneAndUpdate({ email: req.body.email }, {$set:data}, {new: true}, function(e, record){
                                return  res.json(resData);
                            });
                           
                        })

                    }else{
                        return  res.json(resData);
                    }
                });
                
            }

            });



    },
    add : function (req, res) {
        

        if(req.decoded._doc.role.toLowerCase() === "admin"){

            var password = randomString(8, 32);

            var newEnty = util.rmExtToUpdate(Schema,req);

            newEnty["password"] = password;            

            console.log(password)

            var newRecord = new Schema(newEnty);
            newRecord.save(function(e,record) {

                if(!e){
          
                    console.log("process.env.FROM_EMAIL",process.env.FROM_EMAIL)
                    client.sendEmail({
                        "From"     : process.env.FROM_EMAIL || "mani.vannan@uiconnect.in",
                        "To"       : record && record.email,
                        "Subject"  : "Eight minutes System",
                        "TextBody" : ('Your password is ' + (record && password))
                    });
                    return res.status(200).json({
                        "success" : "true",
                        "message" : "Please follow the instrection which sent to your email"
                    });

                }

                return util.apiResp(req,res,e,record)
            });
        }
    },
    getById: function(req, res) {
        
        var id = req.decoded._doc.role.toLowerCase() === "installer" ? req.decoded._doc.id : req.params.id

        Schema.findOne({ _id: id  }, function(e, record) {

            CompanySchema.find({}, function(e, Company) {
                if(record.company_id){

                    var inst = Company.filter(function (a) {
                       return a._id == record.company_id
                    })[0]
                   // console.log(record.company_id,inst.name)

                    record.companyname = inst && inst.name
                }
                return util.apiResp(req,res,e,record)
            });

            //return util.apiResp(req,res,e,record)
        });




    },
    getAll: function(req, res) {
        var filter = {}
        if(req.body.company_id){
            filter["company_id"] = req.body.company_id;
        }


        Schema.find(filter, function(e, records) {
             CompanySchema.find({}, function(e, Company) {
                for(var i in records){
                    var record = records[i];
                    if(record.company_id){

                        var inst = Company.filter(function (a) {
                           return a._id == record.company_id
                        })[0]
                       // console.log(record.company_id,inst.name)

                        record.companyname = inst && inst.name
                    }
                }
                return util.apiResp(req,res,e,records)
            });
            //return util.apiResp(req,res,e,records)
        });

       
    },
    putById: function (req, res) {
        var data = util.rmExtToUpdate(Schema,req);
         if(req.decoded._doc.role.toLowerCase() === "installer" && data["password"]){
            bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
                if (err) return next(err);

                // hash the password using our new salt
                bcrypt.hash(data["password"], salt, null, function(err, hash) {
                    if (err) return next(err);


                    // override the cleartext password with the hashed one
                    data["password"] = hash;
                    

                    Schema.findOneAndUpdate({ _id: req.params.id }, {$set:data}, {new: true}, function(e, record){
                        return util.apiResp(req,res,e,record)
                    });

                });
            });
         }else{
            Schema.findOneAndUpdate({ _id: req.params.id }, {$set:data}, {new: true}, function(e, record){
                return util.apiResp(req,res,e,record)
            });
         }

         //console.log(data)

    },
    deleteById: function (req, res) {
        Schema.findOneAndRemove({ _id: req.params.id }, function(e, record){
            return util.apiResp(req,res,e,record)
        });
    }
}
module.exports = Controller;