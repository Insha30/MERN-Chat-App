const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../config/generateToken');

const authUser = asyncHandler( async( req  , res ) => {
    const { email , password } = req.body;

    const user = await User.findOne( { email } );
    
    if ( user && (await user.matchPassword(password))) {
        res.json( {
            _id: user._id,
            username: user.username,    
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error("Invalid Email or password");
    }
});

const registerUser = asyncHandler( async ( req , res ) => {
    const { username , email , password , pic } = req.body;

    if ( !username || !email || !password ) {
        res.status(400);
        throw new Error('Please enter all the feilds');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    const newUser = await User.create( {
        username ,
        email,
        password,
        pic: pic || "https://res.cloudinary.com/default-image.png",
    });

    if (newUser) {
        res.status(201).json({
            _id: newUser._id, 
            username: newUser.username,
            email : newUser.email,
            pic : newUser.pic,
            token: generateToken(newUser._id),
        });
    } else {
        res.status(400);
        throw new Error("Failed to create User")
    }
});

const allUsers = asyncHandler( async( req , res ) => { 
    const keyword = req.query.search ? {
        $or: [                                                                                              //Using MongoDB OR operator 
            { username : { $regex: req.query.search , $options: 'i'} },
            { email : { $regex: req.query.search , $options: 'i'}},
        ]
    } : {};

    const users = await User.find(keyword).find( {_id :  {$ne : req.user._id} });
    res.send(users);
});

module.exports = { registerUser , authUser , allUsers };