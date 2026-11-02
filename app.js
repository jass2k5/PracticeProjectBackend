const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

const allowedOrigins = [
    process.env.CLIENT_URL || "http://localhost:5173"
];

app.use(cors({
    origin: function(origin,callback){
        if(!origin || allowedOrigins.includes(origin)){
            callback(null,true);//error,false or true true means go ahead 
        }else{
            callback(new Error("Blocked by Cors, unauthorized origin detected"));
        }
    },credentials:true//send and recieve the cookies and jwt allowed
}));

app.use(express.json({limit:"16kb"}));//helps to read incoming json format in req.body
app.use(express.urlencoded({limit:"16kb"}));//helps to read url if the form is sent by html form or url params
app.use(cookieParser());//helps read the cookies coming from the browser and postmen in req.cookies

//server health check api
app.get("/api/health",(req,res)=>{
    return res.status(200).json({
        success:true,
        message:"Test complete the cors and express are working fine"
    })
});

//catch all 404 runs when no api call matches the req api call
app.use((req,res)=>{
    return res.status(404).json({
        success:false,
        message:`Route ${req.originalUrl} does not exist on this server please check and try again`
    })
});

module.exports = app;
