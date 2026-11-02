const multer = require('multer'); // for files and photos

const storage = multer.memoryStorage(); //temp save to ram 

const upload = multer({ //instance
    storage: storage,
    limits:{
        fileSize: 5*1024*1024 //5mb max
    }
});

module.exports = upload;