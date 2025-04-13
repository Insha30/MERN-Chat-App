const asyncHandler = require("express-async-handler");
const Chat = require('../models/chatModel');
const User = require("../models/userModel");

//This route is responsible for creating or fetching a one on one chat. 
//We will be taking the user ID with which we are going to create a chat
const accessChat = asyncHandler( async( req , res ) => {
    
    const { userId } = req.body;

    if (!userId) {
        console.log("User id params not sent with request");
        return res.sendStatus(400);
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users : {$elemMatch : {$eq:req.user._id}}},
            { users : { $elemMatch : { $eq: userId}}},
        ],
    }).populate("users", "-password")
        .populate("latestMessage");

        isChat = await User.populate( isChat , {
            path: 'latestMessage.sender',
            select : "username pic email",
        });

        if ( isChat.length > 0 ) {
            res.send(isChat[0]);
        } else {
            const chatData = {
                chatName : 'sender' ,
                isGroupChat : false ,
                users : [ req.user._id , userId ],
            };
            try {
                const createdChat = await Chat.create(chatData);

                const fullChat = await Chat.findOne({_id: createdChat._id}).populate("users" , "-password");

                res.status(200).send(fullChat);
            } catch (error) {
                res.status(400);
                throw new Error(error.message);
            }
        }
});

//Route responsible for fetching all the chats
const fetchChats = asyncHandler( async ( req , res ) => {
    
    //Here we check which user is logged in and then get all the chats of the user
    try {
        Chat.find( { users : {$elemMatch: { $eq: req.user._id} } })
            .populate("users" , "-password")
            .populate("groupAdmin" , "-password" )
            .populate("latestMessage")
            .sort({ updatedAt: -1})
            .then(async (results) => {
                results = await User.populate( results , {
                    path : "latestMessage.sender",
                    select: "name pic email",
                });
               res.status(200).send(results); 
            });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

//Route responsible for creating a group chat
const createGroupChat = asyncHandler ( async ( req , res ) => {
//Here we will take a bunch of users from the body and the name of the group chat

    if (!req.body.users || !req.body.name ) {
        return res.status(400).send( {message : "Please fill all the feilds"});
    }

    let users = JSON.parse(req.body.users); 

    if ( users.length < 2 ) {
        return res 
        .status(400)
        .send("More than 2 users are required to create a group chat 😓");
    }

    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName : req.body.name ,
            users : users ,
            isGroupChat : true ,
            groupAdmin : req.user,
        });

        const fullGroupChat = await Chat.findOne( { _id : groupChat._id})
            .populate("users" , "-password")
            .populate("groupAdmin" , "-password");

        res.status(200).json(fullGroupChat);

    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }

});

//Route responsible for renaming a group chat
const renameGroup = asyncHandler ( async ( req , res ) => {
    const { chatId , chatName } = req.body;
    
    const updateChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName
        },
        {
            new : true,
        }
    ).populate("users","-password")
    .populate("groupAdmin","-password");

    if (!updateChat) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(updateChat);
    }
});

//Route responsible for adding a user to a group chat
const addToGroup = asyncHandler ( async ( req , res ) => {
    
    const { chatId , userId } = req.body;

    const added = await Chat.findByIdAndUpdate(
        chatId, {
            $push: { users : userId },
        },
        {
            new : true 
        }
    ).populate("users","-password")
    .populate("groupAdmin","-password");

    if ( !added ) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(added);
    }
});

//Route responsible for removing a user from a group chat
const removeFromGroup = asyncHandler ( async ( req , res ) => {
    const { chatId , userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
        chatId , {
            $pull : { users : userId },
        },
        {
            new : true 
        }
    ).populate("users" , "-password")
    .populate("groupAdmin", "-password");

    if ( !removed ) {
        res.status(404);
        throw new Error("Chat not found");
    } else {
        res.json(removed);
    }
});

module.exports = { 
    accessChat , 
    fetchChats , 
    createGroupChat , 
    renameGroup , 
    addToGroup , 
    removeFromGroup
};    