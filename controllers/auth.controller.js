const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ImageKit = require("../config/imagekit");

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
};

const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No refresh token found, please login again"
            });
        }
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        //checking if it's valid
        const user = await User.findById(decodedToken._id).select("+refreshToken");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }
        //valid but is it expired or not {exampe we loged on laptop then on phone laptops cookie holds older}
        if (incomingRefreshToken !== user.refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is expired or already used. Please login again."
            });
        }
        const newAccessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();
        user.refreshToken = newRefreshToken;
        await user.save({validateBeforeSave:false});

        return res
            .status(200)
            .cookie("accessToken", newAccessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }) // 15 mins
            .cookie("refreshToken", newRefreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }) // 7 days
            .json({
                success: true,
                message: "Access token refreshed successfully"
            });


    }catch(error){
        return res.status(401).json({
            success:false,
            message:"Session expired completely.Please login again"
        });
    }
}

const registerUser = async(req,res) =>{
    try{
        const{username,email,password} = req.body;

        if(!username?.trim() || !email?.trim() || !password?.trim()){
            return res.status(400).json({
                success:false,
                message:"All fields (username, email, password) are required"
            });
        }

        const existingUser = await User.findOne({
            $or: [{username:username.toLowerCase()},{email:email.toLowerCase()}]
        });

        if(existingUser){
            return res.status(409).json({
                success:false,
                message:"User with this email or username already exists"
            });
        }

       let avatarData = {
            url: "https://ik.imagekit.io/iq9afzsmr/defaultinstadp.avif?updatedAt=1793642410726",
            fileId: ""
        };

        if(req.file){//the multer save it in the ram with 0 1 binary called buffer and send it to req.file
            const uploadResponse = await ImageKit.upload({
                file:req.file.buffer,
                fileName: `avatar_${Date.now()}_${req.file.originalname}`,
                folder: "/avatars"
            });
            avatarData.url = uploadResponse.url;//for react
            avatarData.fileId = uploadResponse.fileId;//for imagekit to delete it from cloud
        }
        const generateOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiryTime = new Date(Date.now() + 10 * 60 * 1000); //current time  + 10
        

        const user = await User.create({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: password, // we can write single password too as ES6 allows on same name
            avatar: avatarData,
            isVerified: false,
            otp: generateOtp, 
            otpExpiry: otpExpiryTime
        });

        await sendEmail({
            email:user.email,
            subject:"Verify Your Accound - OTP",
            message:`Welcome ${user.username}! Your verification OTP is: ${generateOtp}`
        });

        const createdUser = await User.findById(user._id).select("-password -refreshToken -otp -otpExpiry");

        return res.status(201).json({
            success:true,
            redirectToOtp :true,//for the otp page 
            email:user.email,
            message:"Registered succesfully! Please verify the OTP sent to you email id",
            data:createdUser
        });

    }catch(error){
        console.error("Regsiter Error:", error);
        return res.status(500).json({
            success:false,
            message:"Internal server error during registration please try again"
        });
    }
}
//verify email 
const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select("+otp +otpExpiry");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Account is already verified. Please login."
            });
        }

        if (user.otp !== otp.toString()) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please check your email and try again."
            });
        }

        if (user.otpExpiry < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please login or register again to get a new OTP."
            });
        }

        // Verify user & clean up OTP fields
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true,
            message: "Email verified successfully! You can now log in."
        });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during email verification"
        });
    }
};