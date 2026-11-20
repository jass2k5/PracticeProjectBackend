const Post = require("../models/post.model");
const Like = require("../models/like.model");
const Comment = require("../models/comment.model");
const Follow = require("../models/follow.model");
const Imagekit = require("../config/imagekit");

const createPost = async (req, res) => {
    try {
        if (!req.file) {//400 bad request 
            return res.status(400).json({ success: false, message: "Image is required to post" })
        }

        const postUpload = await imagekit.upload({
            file: req.file.buffer,
            fileName: `post_${Date.now()}_${req.file.originalname}`,
            folder: "/posts" 
        });

        const newPost = await Post.create({
            caption:req.body.caption || "",
            image:{
                url:postUpload.url,
                fileId:postUpload.fileId
            },
            owner:req.user._id

        });// 201 created
        return res.status(201).json({success:true,data:newPost})
    }catch(error){//500 unexpected server error
        return res.status(500).json({success:false,message:error.message});
    }
};
