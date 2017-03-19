var User = require('../db-models/user');
var jwt    = require('jsonwebtoken');
var app =null;
 bcrypt           = require('bcrypt-nodejs');
    SALT_WORK_FACTOR = 10;
var util = require('../util');

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

var UserMethods = {
    setApp: function(a) {
        app = a;
    },
    login:function (req, res) {

        User.findOne({ username: req.body.username }, function(e, user) {
            if (e || !user) {
                console.log(e);
                return res.status(500).send();
            }

            // test a matching password
            user.comparePassword(req.body.password, function(e, isMatch) {

                if (e || !isMatch) {
                    console.log(e);
                    return res.status(500).send();
                }

                var userDetails = {
                    _doc : {
                        username   : user.username,
                        salutation : user.salutation,
                        fname      : user.fname,
                        lname      : user.lname,
                        address1   : user.address1,
                        address2   : user.address2,
                        address3   : user.address3,
                        email      : user.email,
                        phone      : user.phone,
                        role       : user.role
                    }
                };

                var token = jwt.sign(userDetails, req.app.get('superSecret'), {
                  expiresIn : 60*80*10000000 //expires in 80 min
                });
                var resData = {
                  success : true,
                  message : 'Enjoy your token!',
                  token   : token,
                  role    : (user.role.toLowerCase() === "admin")
                }
                if(user.role.toLowerCase() === "admin")
                    resData["role"] = user.role.toLowerCase();

                return  res.json(resData);
            });
        });

    },
    register:function (req, res) {
        User.count({}, function( err, count){
            console.log( "Number of users:", (count+1) );
            var data = util.rmExtToUpdate(User,req);
            data['cid'] = util.custIdFormat(count);
            data['role'] = util.config.role.user;
            var user = new User(data);
            user.save(function(e,user) {
                return util.apiResp(req,res,e,user)
            });
        })


    },
    update: function (req,res) {

    },
    logout: function (req, res) {
        // body...
        // delete the token on user session from browser
    },
    add:function (req,res) {
        // body...
    },
    getAll: function (req,res) {
       if(req.decoded._doc.role.toLowerCase() === "admin"){
            User.find({role:"user"}, function(e, records) {
                return util.apiResp(req,res,e,records)
            });
        }
    },
    getById: function (req,res) {
       if(req.decoded._doc.role.toLowerCase() === "user"){
            User.findOne({username:req.decoded._doc.username}, function(e, records) {
                return util.apiResp(req,res,e,records)
            });
        }
        if(req.decoded._doc.role.toLowerCase() === "admin"){
            User.findOne({username:req.body.username}, function(e, records) {
                return util.apiResp(req,res,e,records)
            });
        }
    },
    putById: function (req,res) {
        var self = this;
       if(req.decoded._doc.role.toLowerCase() === "user"){
            var data = util.rmExtToUpdate(User,req)
            if(req.body.newpassword){
                //data.password = ;

                bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
                    if (err) return next(err);

                    // hash the password using our new salt
                    bcrypt.hash(req.body.newpassword, salt, null, function(err, hash) {
                        if (err) return next(err);


                        // override the cleartext password with the hashed one
                        data["password"] = hash;
                        

                         User.findOneAndUpdate({ username: req.body.username }, {$set:data}, {new: false}, function(e, user){

                            var userDetails = {
                                _doc : {
                                    username   : user.username,
                                    salutation : user.salutation,
                                    fname      : user.fname,
                                    lname      : user.lname,
                                    address1   : user.address1,
                                    address2   : user.address2,
                                    address3   : user.address3,
                                    email      : user.email,
                                    phone      : user.phone,
                                    role       : user.role
                                }
                            };

                            var token = jwt.sign(userDetails, req.app.get('superSecret'), {
                            expiresIn : 60*80*10000000 //expires in 80 min
                            });

                            var resData = {
                              success : true,
                              message : 'Enjoy your token!',
                              token   : token,
                              role    : (user.role.toLowerCase() === "admin")
                            }
                            if(user.role.toLowerCase() === "admin")
                                resData["role"] = user.role.toLowerCase();

                            return  res.json(resData);

                            //return util.apiResp(req,res,e,user)
                        });

                    });
                });


            }else{
                User.findOneAndUpdate({ username: req.body.username }, {$set:data}, {new: false}, function(e, user){

                    var userDetails = {
                        _doc : {
                            username   : user.username,
                            salutation : user.salutation,
                            fname      : user.fname,
                            lname      : user.lname,
                            address1   : user.address1,
                            address2   : user.address2,
                            address3   : user.address3,
                            email      : user.email,
                            phone      : user.phone,
                            role       : user.role
                        }
                    };

                    var token = jwt.sign(userDetails, req.app.get('superSecret'), {
                    expiresIn : 60*80*10000000 //expires in 80 min
                    });

                    var resData = {
                      success : true,
                      message : 'Enjoy your token!',
                      token   : token,
                      role    : (user.role.toLowerCase() === "admin")
                    }
                    if(user.role.toLowerCase() === "admin")
                        resData["role"] = user.role.toLowerCase();

                    return  res.json(resData);

                    //return util.apiResp(req,res,e,user)
                });
            }

            
        }
    },
    userUpdateDetails: function (data,req,res) {
        
    },
    deleteById: function (req,res) {
       if(req.decoded._doc.role.toLowerCase() === "user"){
            User.find({username:req.decoded._doc.username}, function(e, records) {
                return util.apiResp(req,res,e,records)
            });
        }
    },
    forgetPassword: function (req,res) {
        User.findOne({ email: req.body.email }, function(e, user) {
            if (e || !user) {
                return res.status(200).json({
                    "success" : "true",
                    "message" : "Please follow the instrection which sent to your email"
                })
            }

            var password = randomString(8, 32);
            User.findOneAndUpdate({ _id: req.params.id }, {$set:{password : password}}, {new: true}, function(e, u){
                
                if (e) {
                    return res.status(200).json({
                        "success" : "true",
                        "message" : "Please follow the instrection which sent to your email"
                    });
                }
 
                
                client.sendEmail({
                    "From"     : process.env.FROM_EMAIL || "mani.vannan@uiconnect.in",
                    "To"       : user && user.email,
                    "Subject"  : "Eight minutes System",
                    "TextBody" : 'Your new password is ' + password + "\n\nPlease reset your password as earliest"
                });
                return res.status(200).json({
                    "success" : "true",
                    "message" : "Please follow the instrection which sent to your email"
                });
                 
            });

        });

    },
    forgetUsername: function (req,res) {

        var filter = {};
        if(req.body.email.split("@")[1]){
            filter["email"] = req.body.email;
        }else{
            filter["phone"] = req.body.phone;
        }

        User.findOne(filter, function(e, user) {
            if (e || !user) {
                return res.status(200).json({
                    "success" : "true",
                    "message" : "Please follow the instrection which sent to your email"
                })
            }


            client.sendEmail({
                "From"     : process.env.FROM_EMAIL || "mani.vannan@uiconnect.in",
                "To"       : user && user.email,
                "Subject"  : "Eight minutes System",
                "TextBody" : ('Your user name is ' + (user && user.username))
            });
            return res.status(200).json({
                "success" : "true",
                "message" : "Please follow the instrection which sent to your email"
            });

        });

    },
    forgorCred: function () {
        // Todo
    }

}

module.exports = UserMethods;