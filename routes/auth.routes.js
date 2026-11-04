const express = require("express");
const router = express.Router();

const {
    registerUser,
    verifyEmail,
    refreshAccessToken,
    loginUser
} = require("../controllers/auth.controller");

const upload = require("../middlewares/multer.middleware");
const {verifyJWT} = require("../middlewares/auth.middleware");

router.post("/register",upload.single("avatar"),registerUser);
router.post("/verify-email",verifyEmail);
router.post("/refresh-token", refreshAccessToken);
router.post("/login",loginUser);

module.exports = router;