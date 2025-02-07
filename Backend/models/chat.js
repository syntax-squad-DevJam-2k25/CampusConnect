const mongoose = require('mongoose');
const chatSchema = new mongoose.Schema({
    members : {
        type : [
            { type : mongoose.Schema.Types.ObjectId , ref : "User"}
        ]
    },
    lastMessage : {
        type : mongoose.Schema.Types.ObjectId , ref : "message"
    },

    unreadMessageCount : {
        type : Number,
        default : 0
    }
}, {timestamps : true }) ;


module.exports = mongoose.model( "chats", chatSchema ) ;