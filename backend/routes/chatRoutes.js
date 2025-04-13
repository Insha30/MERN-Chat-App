const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { accessChat , fetchChats , createGroupChat , renameGroup , addToGroup  , removeFromGroup } = require('../controllers/chatControllers');
const router = express.Router();

//First route for accessing the chats or creating the chats
router.post('/' , protect , accessChat);

//API to get all the chats of the user
router.get('/' , protect , fetchChats);

//API to create a group chat
router.post('/group' , protect , createGroupChat);

//API for renaming the group chat
router.put('/rename' , protect , renameGroup);

//API to add a user to the group
router.put('/groupadd', protect , addToGroup);

//API to remove a user from a group chat
router.put('/groupremove' , protect , removeFromGroup);

module.exports = router ;