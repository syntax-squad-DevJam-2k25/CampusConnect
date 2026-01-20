import { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";

function Chat() {
  const token = localStorage.getItem("token");

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  // 🔹 Fetch users
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const res = await fetch(
        "http://localhost:5001/api/users/get-all-users",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      console.log("Fetched users:", data);

      // ✅ IMPORTANT FIX
      setUsers(Array.isArray(data.data) ? data.data : []);

      console.log(
        "Users set to:",
        Array.isArray(data.data) ? data.data : []
      );
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  fetchUsers();
}, [token]);


  // 🔹 Filter users
  const filteredUsers = Array.isArray(users)
    ? users.filter(user =>
        user?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Navbar */}
      <Navbar search={search} setSearch={setSearch} />

      {/* Main Content (navbar height = 64px) */}
      <div className="flex flex-1 mt-16 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-gray-100 border-r border-gray-300 overflow-y-auto p-3">
          {filteredUsers.length === 0 && (
            <p className="text-gray-500 text-center mt-4">
              No user found
            </p>
          )}

          {filteredUsers.map(user => (
            <div
              key={user._id}
              onClick={() => setSelectedChat(user)}
              className={`p-3 mb-2 rounded-lg cursor-pointer transition
                ${
                  selectedChat?._id === user._id
                    ? "bg-blue-200"
                    : "bg-white hover:bg-gray-200"
                }
              `}
            >
              <p className="font-medium text-gray-800">
                {user.name}
              </p>
            </div>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {!selectedChat ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
              Select a user to start chat
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-14 border-b border-gray-300 flex items-center px-4 font-semibold">
                Chat with {selectedChat.name}
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {/* messages here */}
              </div>

              {/* Input */}
              <div className="h-14 border-t border-gray-300 flex items-center px-3 gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
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
