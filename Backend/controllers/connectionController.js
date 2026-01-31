const ConnectionRequest = require("../models/ConnectionRequest");
const User = require("../models/User");

// Send a connection request
exports.sendRequest = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { receiverId } = req.body;

        if (senderId === receiverId) {
            return res.status(400).json({ success: false, message: "You cannot connect with yourself." });
        }

        // Check if request already exists
        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        });

        if (existingRequest) {
            if (existingRequest.status === "pending") {
                return res.status(400).json({ success: false, message: "Connection request already pending." });
            }
            if (existingRequest.status === "accepted") {
                return res.status(400).json({ success: false, message: "You are already connected." });
            }
        }

        const newRequest = new ConnectionRequest({
            sender: senderId,
            receiver: receiverId,
            status: "pending"
        });

        await newRequest.save();

        res.status(201).json({ success: true, message: "Connection request sent!" });

    } catch (error) {
        console.error("Send Request Error:", error);
        res.status(500).json({ success: false, message: "Server error sending request." });
    }
};

// Get pending requests (received by current user)
exports.getPendingRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const requests = await ConnectionRequest.find({
            receiver: userId,
            status: "pending"
        }).populate("sender", "name email profileImage role branch");

        res.status(200).json({ success: true, requests });

    } catch (error) {
        console.error("Get Requests Error:", error);
        res.status(500).json({ success: false, message: "Server error fetching requests." });
    }
};

// Get requests sent by current user (to update UI status)
exports.getSentRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const requests = await ConnectionRequest.find({
            sender: userId
        }).select("receiver status");

        res.status(200).json({ success: true, requests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching sent requests" });
    }
};

// Accept a connection request
exports.acceptRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { requestId } = req.body;

        const request = await ConnectionRequest.findOne({
            _id: requestId,
            receiver: userId,
            status: "pending"
        });

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found or already handled." });
        }

        request.status = "accepted";
        await request.save();

        // TODO: Add to users' connection lists if you handle that in User model too
        // For now, ConnectionRequest collection is the source of truth

        res.status(200).json({ success: true, message: "Connection accepted!" });

    } catch (error) {
        console.error("Accept Request Error:", error);
        res.status(500).json({ success: false, message: "Server error accepting request." });
    }
};

// Reject a connection request
exports.rejectRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { requestId } = req.body;

        const request = await ConnectionRequest.findOne({
            _id: requestId,
            receiver: userId,
            status: "pending"
        });

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found." });
        }

        request.status = "rejected";
        await request.save(); // Or delete it

        res.status(200).json({ success: true, message: "Connection rejected." });

    } catch (error) {
        console.error("Reject Request Error:", error);
        res.status(500).json({ success: false, message: "Server error rejecting request." });
    }
};
