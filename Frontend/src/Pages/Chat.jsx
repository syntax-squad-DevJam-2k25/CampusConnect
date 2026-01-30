import { useEffect, useState } from "react";
import { DashboardLayout } from "../Components/DashboardLayout";
import socket from "../socket"; // socket.io-client file
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    if (!window.confirm("Are you sure you want to delete this message?")) return;

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

    toast.success("Message deleted successfully");
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
    <DashboardLayout >
      <div className="h-[calc(100vh-8.5rem)] w-full flex bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* SIDEBAR */}
        <div className="w-80 border-r border-slate-800 bg-slate-900 overflow-y-auto">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Contacts</h2>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 text-slate-300 placeholder-slate-500 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {filteredUsers.map((u) => (
            <div
              key={u._id}
              onClick={() => handleSelectUser(u)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 border-b border-slate-800/50 hover:bg-slate-800
                ${selectedUser?._id === u._id
                  ? "bg-slate-800 border-l-2 border-l-blue-500 pl-[14px]"
                  : "border-l-2 border-l-transparent"}`}
            >
              <div className="relative">
                {u?.profileImage ? (
                  <img
                    src={u.profileImage}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-300 ring-2 ring-slate-700">
                    {u?.name?.charAt(0)}
                  </div>
                )}
                {/* Online status indicator can go here */}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${selectedUser?._id === u._id ? "text-white" : "text-slate-300"}`}>
                  {u.name}
                </p>
                {/* Last message preview could go here */}
              </div>
            </div>
          ))}
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col bg-slate-950">
          {!currentChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p>Select a user to start chatting</p>
            </div>
          ) : (
            <>
              {/* HEADER */}
              <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-6 shadow-sm z-10">
                <div className="flex items-center gap-3">
                  {selectedUser?.profileImage ? (
                    <img
                      src={selectedUser.profileImage}
                      alt={selectedUser.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-700"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-300 ring-2 ring-slate-700">
                      {selectedUser?.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-slate-200 font-semibold">{selectedUser?.name}</h3>
                  </div>
                </div>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {messages.map((msg) => {
                  const isMine = msg.sender === myUserId;
                  return (
                    <div
                      key={msg._id}
                      className={`flex mb-2 ${isMine ? "justify-end" : "justify-start"} group`}
                    >
                      <div className={`flex flex-col max-w-[70%] ${isMine ? "items-end" : "items-start"}`}>
                        <div
                          className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                            ${isMine
                              ? "bg-blue-600/90 text-white rounded-br-sm"
                              : "bg-slate-800 text-slate-200 rounded-bl-sm"}`}
                        >
                          {!isMine && (
                            <div className="text-[10px] font-bold opacity-50 mb-1 text-slate-400">
                              {userMap[msg.sender]}
                            </div>
                          )}

                          {editingMsgId === msg._id ? (
                            <div className="flex gap-2 items-center min-w-[200px]">
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
                                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 w-full focus:outline-none focus:border-blue-500"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button onClick={(e) => { e.stopPropagation(); handleEditMessage(msg._id); }} className="text-green-400 hover:text-green-300">✓</button>
                              <button onClick={(e) => { e.stopPropagation(); setEditingMsgId(null); }} className="text-slate-400 hover:text-slate-300">✕</button>
                            </div>
                          ) : (
                            <>
                              <div className="break-words">{msg.text}</div>
                              {msg.edited && (
                                <span className="text-[10px] ml-1 opacity-60 italic block text-right mt-1">
                                  (edited)
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        <div className="text-[10px] text-slate-500 mt-1 px-1">
                          {msg.read ? "Seen" : "Delivered"}
                        </div>

                        {/* ACTIONS */}
                        {isMine && editingMsgId !== msg._id && (
                          <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-1">
                            <button
                              onClick={() => {
                                setEditingMsgId(msg._id);
                                setEditedText(msg.text);
                              }}
                              className="text-[10px] text-slate-400 hover:text-blue-400 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg._id)}
                              className="text-[10px] text-slate-400 hover:text-red-400 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* INPUT */}
              <div className="p-4 bg-slate-900 border-t border-slate-800">
                <div className="flex items-center gap-3 bg-slate-950 border border-slate-700 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-200">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </DashboardLayout>
  );
}

export default Chat;
