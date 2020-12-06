const express = require('express');
const app = express();

const mongoose = require('mongoose');
const config = require('./config/keys');
mongoose.connect(config.mongoURI,{useNewUrlParser:true,
                                  //useUnifiedTopology:true,
                                  useCreateIndex: true,
                                  useFindAndModify: false
                                })
        .then(()=>console.log("MongoDB connected successfully"))
        .catch((err)=>console.log(`MongoDB connection failed due to ${err}`));

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());

const cors = require('cors');
const path = require('path');

app.use(cors());

const {User} = require('./models/user.model');
//Router to handle get requests for the homepage
app.get('/',(req,res)=>{
    res.send("Avengers! Assemble!");
    
});
//Router to handle the register/sign up of new users
app.post('/api/users/register',(req,res)=>{
    const user = new User(req.body);
    user.save((err,userData)=>{
        if(err)
            return res.json({
                success:false,
                err
            });
        return res.status(200).json({success: true});
    });
});

//Router to handle Logging in of existing users
app.post('/api/users/login',(req,res)=>{
    //Find the email in the DB
    User.findOne({email:req.body.email},(err,user)=>{
        if(!user)
            return res.json({loginSuccess: false,
                            message:"No user found for this email id."});
        //If the email Id exists in the DB, then compare the passwords.
        user.comparePasswords(req.body.password,(err,isMatch)=>{
            if(!isMatch)
                return res.json({loginSuccess:false,
                message:"Passwords do not match."
            });
            //If the psswords match, then generate a token for the user and put that in a cookie
            user.generateToken((err,user)=>{
                if(err)
                    return res.status(400).send(err);
                res.cookie("x_authExp", user.tokenExp);
                return res.cookie('x_auth',user.token)
                          .status(200)
                          .json({loginSuccess: true});
            });
            
        });
    });
});

//Router to handle the authentication of the user
const {auth} = require('./middleware/auth');
app.get('/api/users/auth',auth,(req,res)=>{
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0? false:true,
        isAuth: true,
        email: req.user.email,
        lastname: req.user.lastname,
        role:req.user.role,
        image:req.user.image
    });
});

//Router to handle the logout of a user
app.get('/api/users/logout',auth, (req,res)=>{
    User.findOneAndUpdate({_id:req.user._id},{token:"", tokenExp:''},(err,doc)=>{
        if(err)
            return res.json({success:false,
                            err});
        return res.status(200).send({success:false});
    });
});
const port = process.env.PORT || 5001;
app.listen(port);