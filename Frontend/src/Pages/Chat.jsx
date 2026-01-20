import { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import socket from "../socket"; // socket.io-client file

function Chat() {


  const token = localStorage.getItem("token");

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
const user = JSON.parse(localStorage.getItem("user")); 
const myUserId = user?._id;
  const userMap = users.reduce((acc, u) => {
  acc[u._id] = u.name;
  return acc;
}, {});

  /* =========================
     FETCH USERS
     ========================= */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          "http://localhost:5001/api/users/get-all-users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setUsers(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error("Fetch users error:", err);
      }
    };

    fetchUsers();
  }, [token]);

  /* =========================
     SOCKET LISTENER
     ========================= */
  useEffect(() => {
    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, []);

  /* =========================
     FILTER USERS
     ========================= */
  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  /* =========================
     SELECT USER → CREATE / GET CHAT
     ========================= */
  const handleSelectUser = async (user) => {
    try {
      setSelectedUser(user);

      const res = await fetch(
        "http://localhost:5001/api/chat/create-new-chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: user._id }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setCurrentChat(data.chat);
        setMessages(data.chat.messages || []);

        // join socket room
        socket.emit("join-chat", data.chat._id);
      }
    } catch (err) {
      console.error("Create chat error:", err);
    }
  };

  /* =========================
     SEND MESSAGE
     ========================= */
  const handleSendMessage = async () => {
    if (!message.trim() || !currentChat) return;

    try {
      await fetch("http://localhost:5001/api/chat/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: currentChat._id,
          text: message,
        }),
      });

      setMessage("");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Navbar */}
      {/* <Navbar search={search} setSearch={setSearch} /> */}

      {/* Main */}
      <div className="flex flex-1 mt-16 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-gray-100 border-r overflow-y-auto p-3">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => handleSelectUser(user)}
              className={`p-3 mb-2 rounded-lg cursor-pointer
                ${
                  selectedUser?._id === user._id
                    ? "bg-blue-200"
                    : "bg-white hover:bg-gray-200"
                }`}
            >
              {user.name}
            </div>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {!currentChat ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a user to start chat
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="h-14 border-b flex items-center px-4 font-semibold">
                Chat with {selectedUser?.name}
              </div>

              {/* Messages */}
         <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
  {messages.map((msg, index) => {
    const isMine = msg.sender === myUserId;
    const senderName = userMap[msg.sender] || "Unknown";

    return (
      <div
        key={index}
        className={`flex mb-3 ${isMine ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-xs px-3 py-2 rounded-lg text-sm
            ${isMine
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-white text-gray-800 rounded-bl-none"}
          `}
        >
          {/* 👤 USER NAME */}
          <div className="text-[11px] font-semibold mb-1 opacity-80">
            {isMine ? "You" : senderName}
          </div>

          {/* 💬 MESSAGE */}
          <div>{msg.text || msg.emoji}</div>

          {/* ✓✓ STATUS */}
          {isMine && (
            <div className="text-[10px] text-right mt-1 opacity-70">
              {msg.read ? "✓✓ Seen" : "✓✓ Delivered"}
            </div>
          )}
        </div>
      </div>
    );
  })}
</div>



              {/* Input */}
              <div className="h-14 border-t flex items-center px-3 gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-lg px-3 py-2 outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
