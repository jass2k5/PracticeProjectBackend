const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    caption:{
        type:String,
        trim:true,
        maxLength:[2200,"Caption cannot exceed 2200 characters"],
        default:""
    },
    image:{
        url:{
            type:String,
            required:[true,"Image URL is required"]
        },
        fileId:{
            type:String,
            required:[true,"ImageKit fileId is required"]
        }
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    },
    likesCount:{
        type:Number,
        default:0
    },
    commentCount:{
        type:Number,
        default:0
    }
},{timestamps:true});

const Post = mongoose.model("post",postSchema);
module.exports = Post;