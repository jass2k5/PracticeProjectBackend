const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const usernameRegex = /^[a-zA-Z0-9._]{3,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,//no other user can have this name 
        trim: true,
        lowercase: true,
        index: true,//b tree makes the complexity lower for searching
        match: [usernameRegex, "Invalid username format (3-20 chars,letters,numbers,_,."]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
        match: [emailRegex, "please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Passowrd is required"],
        minlength: [6, "password must be at least 6 characters"],
        select: false//don't send it with the other data 
    },
    bio: {
        type: String,
        default: "",
        trim: true,
        maxlength: [150, "Bio cannot exceed 150 words"]
    }, avatar: {
        url: {
            type: String,
            default: "https://ik.imagekit.io/iq9afzsmr/defaultinstadp.avif?updatedAt=1793642410726"
        }, fileId: {
            type: String,
            default: ""
        }
    },
    followersCount: { type: Number, default: 0, min: 0 },
    followingCount: { type: Number, default: 0, min: 0 },
    postsCount: { type: Number, default: 0, min: 0 },

    isVerified:{
        type:Boolean,
        default:false
    },
    otp:{
        type:String,
        select:false
    },
    otpExpiry:{
        type:Date,
        select:false // again hidden for security
    },
    refreshToken:{
        type:String,
        select:false
    }
},{timestamps:true});

userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next();//agr modified hi nhi hua to 
    this.password = await bcrypt.hash(this.password,10);
    next();
});

//compare and this is methods function 
userSchema.methods.isPasswordCorrect = async function (plainTextPassword){
    return await bcrypt.compare(plainTextPassword,this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
    );
};

const User = mongoose.model("User",userSchema);
module.exports = User;
