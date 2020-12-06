const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    name: {
        type:String,
        maxlength:50
    },
    email: {
        type:String,
        trim:true,
        unique: 1 
    },
    password: {
        type: String,
        minglength: 5
    },
    lastname: {
        type:String,
        maxlength: 50
    },
    role : {
        type:Number,
        default: 0 
    },
    image: String,
    token : {
        type: String,
    },
    tokenExp :{
        type: Number
    }
});
const bcrypt = require('bcrypt');
const saltRounds = 10;

//Function to encrypt the password
userSchema.pre('save',function(next){
    const user = this;
    //To run this only if the password field has been modified
    if(user.isModified('password')){
        bcrypt.genSalt(saltRounds,function(err,salt){
            if(err)
                return next(err);
            bcrypt.hash(user.password,salt,function(err,hash){
                if(err)
                    return next(err);
                user.password=hash;
                next();
            });
        });
    }
    else {
        next();
    }
});

userSchema.methods.comparePasswords = function(plainTextPassword,callbackFunction){
    bcrypt.compare(plainTextPassword,this.password,(err,isMatch)=>{
        if(err)
            return callbackFunction(err);
        return callbackFunction(null, isMatch);
    });
}

const jwt = require('jsonwebtoken');
const moment = require('moment');
userSchema.methods.generateToken=function(callbackFunction){
    const user = this;
    var token = jwt.sign(user._id.toHexString(),'Shshshsh');
    var oneHour = moment().add(1,'hour').valueOf();

    user.tokenExp = oneHour;
    user.token = token;

    user.save((err,userData)=>{
        if(err)
            return callbackFunction(err);
        callbackFunction(null,userData);
    });

};

userSchema.statics.findByToken=(token, callbackFunction)=>{
    var user = this;
    jwt.verify(token,'Shshshsh',(err,decodedToken)=>{
        User.findOne({"_id":decodedToken, "token":token},(err,user)=>{
            if(err)
                return callbackFunction(err);
            return callbackFunction(null, user);
        });
    });
};

const User = mongoose.model('User',userSchema);
module.exports={User};