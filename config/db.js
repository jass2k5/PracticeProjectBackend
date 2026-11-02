const mongoose = require("mongoose");

const connectDB = async ()=>{
    try{
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected ");
    }catch(error){
        throw new Error("MongoDb failed to connect to server")
    }
};

module.exports = connectDB;