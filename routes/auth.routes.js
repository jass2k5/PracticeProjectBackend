const express = require("express");
const router = express.Router();

const {
    registerUser,
    verifyEmail,
    refreshAccessToken,
    loginUser,
    logoutUser,
    getCurrentUser
} = require("../controllers/auth.controller");

const upload = require("../middlewares/multer.middleware");
const verifyJWT = require("../middlewares/auth.middleware");

//Public routes
router.post("/register",upload.single("avatar"),registerUser);
router.post("/verify-email",verifyEmail);
router.post("/refresh-token", refreshAccessToken);
router.post("/login",loginUser);

//Protected routes
router.post("/logout",verifyJWT,logoutUser);
router.get("/me",verifyJWT,getCurrentUser)

module.exports = router;