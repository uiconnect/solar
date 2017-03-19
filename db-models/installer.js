var mongoose = require('mongoose'),
	util = require('../util'),
    bcrypt           = require('bcrypt-nodejs'),
    SALT_WORK_FACTOR = 10,
    Schema = mongoose.Schema;



var Installer = new Schema({

	name       : util.dbValidation.str,
    company_id : util.dbValidation.str,
	companyname : util.dbValidation.str,
	location   : util.dbValidation.str,
	desig      : util.dbValidation.str,
	desc       : util.dbValidation.str,
	phone      : util.dbValidation.str,
	email      : {
                    type     : String,
                    required : true, 
                    index    : { unique: true } ,
                    min      : 5,
                    max      : 40
    },
	password   : {
                    type     : String,
                    min      : 5,
                    required : true, 
                    max      : 10
    			},
	pic        : {type : String}

});

	Installer.options.toJSON = {
        transform: function(doc, ret, options) {
            delete ret.__v;
            delete ret.password;
            return ret;
        }
    };

    Installer.pre('save', function(next) {
        var installer = this;

        // only hash the password if it has been modified (or is new)
        if (!installer.isModified('password')) return next();

        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            if (err) return next(err);

            // hash the password using our new salt
            bcrypt.hash(installer.password, salt,null, function(err, hash) {
                if (err) return next(err);

                console.log("hash: ",hash)

                // override the cleartext password with the hashed one
                installer.password = hash;
                next();
            });
        });
    });

    Installer.pre('update', function(next) {
        console.log("pre update")
        var installer = this;

        // only hash the password if it has been modified (or is new)
        if (!installer.isModified('password')) return next();

        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            if (err) return next(err);

            // hash the password using our new salt
            bcrypt.hash(installer.password, salt, null, function(err, hash) {
                if (err) return next(err);

                console.log("hash: ",hash)

                // override the cleartext password with the hashed one
                installer.password = hash;
                next();
            });
        });
    });

    Installer.methods.passHash = function(candidatePassword, cb) {
        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            if (err) return next(err);

            // hash the password using our new salt
            bcrypt.hash(candidatePassword, salt,null, function(err, hash) {
                if (err) return next(err);
                cb(hash);
            });
        });
    }


    Installer.methods.comparePassword = function(candidatePassword, cb) {
	    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
	        if (err) return cb(err);
	        cb(null, isMatch);
	    });
	}

module.exports = mongoose.model('installer', Installer);