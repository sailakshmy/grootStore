const express = require('express');
const app = express();

const mongoose = require('mongoose');
const config = require('./config/keys');
mongoose.connect(config.mongoURI,{useNewUrlParser:true})
        .then(()=>console.log("MongoDB connected successfully"))
        .catch((err)=>console.log(`MongoDB connection failed due to ${err}`));

//Router to handle get requests for the homepage
app.get('/',(req,res)=>{
    res.send("Avengers! Assemble!");
    
});

const port = process.env.PORT || 5001;
app.listen(port);