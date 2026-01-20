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

  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [openMenuMsgId, setOpenMenuMsgId] = useState(null);

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
        console.log("Fetched users:", data.data);
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

    socket.on("message-edited", ({ messageId, newText }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, text: newText, edited: true }
            : msg
        )
      );
    });

    socket.on("message-deleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== messageId)
      );
    });

    return () => {
      socket.off("receive-message");
      socket.off("message-edited");
      socket.off("message-deleted");
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
  const handleEditMessage = async (msgId) => {
    if (!editedText.trim()) return;

    await fetch("http://localhost:5001/api/chat/edit-message", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        chatId: currentChat._id,
        messageId: msgId,
        newText: editedText,
      }),
    });

    setEditingMsgId(null);
    setEditedText("");
  };
  const handleDeleteMessage = async (msgId) => {
    await fetch("http://localhost:5001/api/chat/delete-message", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        chatId: currentChat._id,
        messageId: msgId,
      }),
    });
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
    <div className="h-screen w-full flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* SIDEBAR */}
      <div className="w-80 mtbg-white border-r border-gray-200 overflow-y-auto shadow-sm">
        <div className="p-5 mt-5 bg-gradient-to-r from-blue-500 to-blue-600 bg-black">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        {users.map((u) => (
          <div
            key={u._id}
            onClick={() => handleSelectUser(u)}
            className={`flex items-center gap-3 px-4 py-4 cursor-pointer transition duration-200 border-b border-gray-100 group hover:bg-blue-50
              ${selectedUser?._id === u._id ? "bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500" : ""}`}
          >
            <div className={`w-12 h-12 rounded-full bg-black flex items-center justify-center font-bold text-lg transition duration-200 ${selectedUser?._id === u._id ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md" : "bg-gradient-to-br from-blue-400 to-blue-500 group-hover:shadow-md"}`}>
            {u?.profileImage ? (
  <img
    src={u.profileImage}
    alt={u.name}
    className="w-12 h-12 rounded-full object-cover"
  />
) : (
  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 bg-black flex items-center justify-center font-bold text-lg">
    {selectedUser?.name?.charAt(0)}
  </div>
)}

            </div>
            <div className="flex-1">
              <p className={`font-semibold ${selectedUser?._id === u._id ? "text-blue-700" : "text-gray-800"}`}>{u.name}</p>
            
            </div>
          </div>
        ))}
      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col">
        {!currentChat ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a user
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="h-25 bg-white border-b border-gray-200 flex items-center px-6 font-semibold shadow-sm">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 bg-black flex items-center justify-center font-bold text-lg">
                  {selectedUser?.profileImage ? (
  <img
    src={selectedUser.profileImage}
    alt={selectedUser.name}
    className="w-12 h-12 rounded-full object-cover"
  />
) : (
  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 bg-black flex items-center justify-center font-bold text-lg">
    {selectedUser?.name?.charAt(0)}
  </div>
)}

                </div>
                <div>
                  <p className="text-gray-800 font-bold">{selectedUser?.name}</p>
                
                </div>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-white to-gray-50 space-y-4">
              {messages.map((msg) => {
                const isMine = msg.sender === myUserId;
                return (
                  <div
                    key={msg._id}
                    className={`flex mb-4 ${isMine ? "justify-end" : "justify-start"} group`}
                  >
                    <div className="flex flex-col gap-1 max-w-sm">
                      <div
                        className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed transition duration-200 shadow-sm hover:shadow-md
                          ${isMine
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 bg-black rounded-br-none"
                            : "bg-white text-gray-800 rounded-bl-none border border-gray-200"}`}
                      >
                        <div className="text-[11px] font-bold opacity-70 mb-1">
                          {isMine ? "You" : userMap[msg.sender]}
                        </div>

                        {editingMsgId === msg._id ? (
                          <div className="flex gap-2 items-center mt-2">
                            <input
                              value={editedText}
                              onChange={(e) => setEditedText(e.target.value)}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === "Enter") handleEditMessage(msg._id);
                                if (e.key === "Escape") {
                                  setEditingMsgId(null);
                                  setEditedText("");
                                }
                              }}
                              className={`border-2 rounded-lg px-3 py-1.5 text-sm flex-1 transition duration-200 focus:outline-none ${
                                isMine
                                  ? "border-blue-200 bg-blue-400 bg-black placeholder-blue-200 focus:border-blue-100 focus:ring-2 focus:ring-blue-300"
                                  : "border-blue-300 bg-white text-black placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                              }`}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMessage(msg._id);
                              }}
                              className="bg-green-500 hover:bg-green-600 active:scale-95 bg-black px-3 py-1.5 rounded-lg text-xs font-bold transition duration-150 transform"
                              title="Save (Enter)"
                            >
                              ✓
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingMsgId(null);
                                setEditedText("");
                              }}
                              className="bg-gray-500 hover:bg-gray-600 active:scale-95 bg-black px-3 py-1.5 rounded-lg text-xs font-bold transition duration-150 transform"
                              title="Cancel (Esc)"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="break-words">{msg.text}</div>
                            {msg.edited && (
                              <span className="text-[10px] ml-1 opacity-60 italic">
                                (edited)
                              </span>
                            )}
                          </>
                        )}

                        <div className="text-[11px] text-right mt-1 opacity-70 font-semibold">
                          {msg.read ? "✓✓ Seen" : "✓ Delivered"}
                        </div>

                        {/* EDIT/DELETE BUTTONS - SHOWN ON HOVER */}
                        {isMine && editingMsgId !== msg._id && (
                          <div className="absolute -top-8 right-0 flex gap-1 bg-white rounded-lg shadow-lg p-1 opacity-0 group-hover:opacity-100 transition duration-200 border border-gray-200">
                            <button
                              onClick={() => {
                                setEditingMsgId(msg._id);
                                setEditedText(msg.text);
                              }}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-md text-xs font-bold transition duration-150 flex items-center gap-1"
                              title="Edit Message"
                            >
                              ✎ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg._id)}
                              className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-md text-xs font-bold transition duration-150 flex items-center gap-1"
                              title="Delete Message"
                            >
                              🗑 Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* INPUT */}
            <div className="h-20 bg-white border-t border-gray-200 flex items-center gap-3 px-6 shadow-lg">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 border-2 border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
              />
              <button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-95 text-black px-8 py-3 rounded-full font-bold transition duration-150 transform shadow-md hover:shadow-lg"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;
