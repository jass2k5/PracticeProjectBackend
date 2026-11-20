const mongoose = require("mongoose")

const commentSchema = mongoose.Schema({
    text:{
        type:String,
        required:[true,"Comment is required for testing"],
        trim:true,
        maxLength:500
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        required:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true});

commentSchema.index({ post: 1, createdAt: -1 });

const Comment = mongoose.model("Comment",commentSchema);

module.exports = Comment;
