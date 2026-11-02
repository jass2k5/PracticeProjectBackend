require("dotenv").config();//use to read the env
const app = require('./app');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 3000;

connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is listening on Port ${PORT}`);
        console.log(`Local URL: http://localhost:${PORT}`);
    })
}).catch((error)=>{
    process.exit(1);//forcefully stop server it would work without db too
})



