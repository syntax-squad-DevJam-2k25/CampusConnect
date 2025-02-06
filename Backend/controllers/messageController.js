const router = require('express').Router();
const authMiddleware = require('./../middleware/authMiddleware');
const Chat = require('./../models/chat');
const message = require('./../models/message');
const Message = require( './../models/message');


router.post('/new-message', authMiddleware, async (req, res) => {
    try{
        //Store the message in message collection
        
        const newMessage = new Message(req.body);
        const savedMessage = await newMessage.save();

        //update the lastMessage in chat collection
        // const currentChat = await Chat.findById(req.body.chatId);
        // currentChat.lastMessage = savedMessage._id;
        // await currentChat.save()

        const currentChat = await Chat.findOneAndUpdate({
            _id: req.body.chatId
        }, {
            lastMessage: savedMessage._id,
            $inc: {unreadMessageCount: 1}
        });
        
        if (!currentChat) {
            return res.status(404).send({
                message: "Chat not found",
                success: false
            });
        }

        res.status(201).send({
            message: 'Message sent successfully',
            success: true,
            data: savedMessage
        })
    }catch(error){
        res.status(400).send({
            message: error.message,
            success: false
        });
    }
});

router.get('/get-all-messages/:chatId' , authMiddleware , async (req, res) =>{
    try{

        const allMessages = await Message.find( { chatId : req.params.chatId }).sort({createdAt: 1});
        res.send({
            message: "messages fetched successfully",
            success: true,
            data: allMessages
        })

    }catch( error) {
        res.status(400).send({
            message : error.message, 
            success : false
        })
    }
})

module.exports = router ;
