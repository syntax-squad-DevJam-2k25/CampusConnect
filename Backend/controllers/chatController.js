const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const Chat = require('./../models/chat');

router.post('/create-new-chat' , authMiddleware , async (req, res) => {
    try {

        const chat = new Chat( req.body );
        const savedChat = await chat.save();

        res.status(201).send({
            message: 'Chat created successfully',
            success :true,
            data: savedChat
        })

    }catch (error){
        res.status(400).send({
            message :error.message, 
            success : false
        })
    }
});

router.get('/get-all-chats' , authMiddleware , async (req, res) => {
    try {
        console.log("id" +req.user.userId);
        const allChats = await  Chat.find({ members : { $in : req.user.userId } }).populate('members').populate('lastMessage').sort({ updatedAt : -1});
                                                        // 
                                                        // 
                                                        //
        
        res.status(200).send({
            message: 'all chats fetched successfully',
            success :true,
            data: allChats
        })

    }catch (error){
        res.status(400).send({
            message :error.message, 
            success : false
        })
    }
})

module.exports =  router;