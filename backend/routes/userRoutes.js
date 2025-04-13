const express = require('express');
const { registerUser ,authUser , allUsers} = require('../controllers/userControllers'); 
const router = express.Router();
const { uploadProfilePic } = require("../controllers/uploadController"); 
const multer = require("multer");
const  { protect } = require("../middleware/authMiddleware");

// Multer configuration to handle file uploads
const storage = multer.memoryStorage(); // Using memory storage
const upload = multer({ storage }); // Create upload middleware with memory storage


router.post('/register',registerUser);    
router.get('/', protect, allUsers); 
router.post('/login',authUser);
router.post("/upload", upload.single("file"), uploadProfilePic); 

module.exports = router ;