const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const verifyJWT= async(req,res,next) =>{
    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");

        if(!token){
            return res.status(401).json({
                success:false,
                message:"Unauthorized request: No access token provided"
            });
        }

        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);//checks the expiry too if not catch block runs
        const user = await User.findById(decodedToken._id);//getting the user from model with this id

        if(!user){
            return res.status(401).json({
                success:false,
                message:"Inavlid Access Token: User not found"
            })
        };

        req.user = user;
        next();
    }catch(error){
        return res.status(401).json({
            success:false,
           message: error.name === "TokenExpiredError" ? "ACCESS_TOKEN_EXPIRED" : "Invalid access token"
        })
    }
};
module.exports = verifyJWT;