import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";
import { FaHeart, FaComment, FaShare, FaSmile, FaImage, FaVideo, FaTrash, FaPaperclip, FaFilePdf, FaFileWord, FaFileExcel } from "react-icons/fa";
import socket from "../socket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Community = () => {
  const token = localStorage.getItem("token");
const currentUserId = localStorage.getItem("userId"); 

  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [data, setData] = useState([]);
  const [totalLikes, setTotalLikes] = useState(0);


  // ================= DELETE POST =================
  //=================Work properly================= 
  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await axios.delete(
          `http://localhost:5001/api/community/delete/${postId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        // Refresh feed
        fetchPosts();
        toast.success("Post deleted successfully");
      } catch (err) {
        console.error(err);
        toast.error("You can not delete other Post");
      }
    }
  };

  useEffect(() => {
  socket.on("postCreated", (post) => {
    setPosts((prev) => [post, ...prev]);
  });

  socket.on("postLiked", ({ postId, likesCount }) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, likesCount } : p
      )
    );
  });

  socket.on("postDeleted", (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  });

  return () => {
    socket.off("postCreated");
    socket.off("postLiked");
    socket.off("postDeleted");
  };
}, []);

  // ================= CREATE POST =================
  const handlePost = async () => {
    if (!content && !file) {
      toast.warning("Please write something or upload a file");
      return;
    }

    const formData = new FormData();
    formData.append("content", content);
    formData.append("isAnonymous", isAnonymous);

    if (file) {
      formData.append("file", file);
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5001/api/community/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      // Reset fields
      setContent("");
      setFile(null);
      setIsAnonymous(false);

      // Refresh feed
      fetchPosts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create post");
    } finally {
      setLoading(false);
    }
  };
const [totalUsers, setTotalUsers] = useState(0);

const getTotalUsers = async () => {
  try {
    const res = await fetch(
      "http://localhost:5001/api/users/count",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setTotalUsers(data.totalUsers);
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchPosts();
  getTotalUsers();   // ✅ ADD THIS
}, []);

const handleLike = async (postId) => {
  try {
    const res = await axios.post(
      `http://localhost:5001/api/community/like/${postId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { liked } = res.data;

    setPosts((prev) =>
      prev.map((post) => {
        if (post._id !== postId) return post;

        const safeLikes = Array.isArray(post.likes) ? post.likes : [];

        return {
          ...post,
          likes: liked
            ? [...safeLikes, currentUserId]
            : safeLikes.filter((id) => id !== currentUserId),
        };
      })
    );
    toast.success(liked ? "Post liked" : "Like removed");
  } catch (err) {
    console.error(err);
    toast.error("Failed to like post");
  }
};



socket.on("postLiked", ({ postId, likesCount }) => {
  setPosts((prev) =>
    prev.map((p) =>
      p._id === postId ? { ...p, likesCount } : p
    )
  );
});


  // ================= FETCH POSTS =================
  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);

      const res = await axios.get(
        "http://localhost:5001/api/community/",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPosts(res.data.posts || []);
      setTotalLikes(res.data.totalLikes || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load community posts");
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <>
      <Navbar />
 <ToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    pauseOnHover
    theme="dark"
  />
      <div className="w-screen h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden flex flex-col">
        {/* Header */}
        <div className="pt-24 px-6 pb-6 border-b border-gray-700">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Community Hub
            </h1>
            <p className="text-gray-400">Connect, share, and grow together</p>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex-1 overflow-y-auto flex gap-6 px-6 py-6 max-w-7xl mx-auto w-full">
          {/* Left Column - Create Post & Feed */}
          <div className="flex-1">
            {/* CREATE POST SECTION */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-700 mb-6 hover:border-green-400 transition-all duration-300">
              <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center font-bold text-black">
                  You
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="What's on your mind? 🤔"
                    className="w-full bg-gray-700 text-white p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400 transition-all"
                    rows="3"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
              </div>

              {/* File Preview */}
              {file && (
                <div className="mb-4 p-4 bg-gradient-to-r from-green-900/30 to-cyan-900/30 rounded-lg border border-green-600/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <FaPaperclip className="text-green-400 text-lg" />
                    <div>
                      <p className="text-sm font-semibold text-gray-300">{file.name}</p>
                      <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-red-400 hover:text-red-300 text-sm hover:bg-red-400/10 px-3 py-1 rounded-lg transition"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* File Upload & Options */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2 items-center">
                  <label className="cursor-pointer p-3 hover:bg-gray-700 rounded-lg transition flex items-center gap-2 group" title="Upload Image">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    <FaImage className="text-green-400 text-lg group-hover:scale-110 transition" />
                    <span className="text-xs text-gray-300">Image</span>
                  </label>
                  <label className="cursor-pointer p-3 hover:bg-gray-700 rounded-lg transition flex items-center gap-2 group" title="Upload Video">
                    <input
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    <FaVideo className="text-cyan-400 text-lg group-hover:scale-110 transition" />
                    <span className="text-xs text-gray-300">Video</span>
                  </label>
                  <label className="cursor-pointer p-3 hover:bg-gray-700 rounded-lg transition flex items-center gap-2 group" title="Upload File">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    <FaPaperclip className="text-yellow-400 text-lg group-hover:scale-110 transition" />
                    <span className="text-xs text-gray-300">File</span>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 px-3 py-2 rounded-lg transition">
                    <input
                      type="checkbox"
                      className="accent-green-400"
                      checked={isAnonymous}
                      onChange={() => setIsAnonymous(!isAnonymous)}
                    />
                    <span className="text-sm">Anonymous</span>
                  </label>

                  <button
                    onClick={handlePost}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-green-400 to-cyan-400 text-black rounded-full font-bold hover:shadow-lg hover:shadow-green-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            </div>

            {/* POSTS FEED */}
            <div className="space-y-5">
              {loadingPosts && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin">
                    <div className="w-12 h-12 border-4 border-gray-600 border-t-green-400 rounded-full"></div>
                  </div>
                  <p className="text-gray-400 mt-4">Loading community posts...</p>
                </div>
              )}

              {!loadingPosts && posts.length === 0 && (
                <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700">
                  <p className="text-gray-400 text-lg">
                    No posts yet. Be the first to share! 🚀
                  </p>
                </div>
              )}

              {posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg border border-gray-700 overflow-hidden hover:border-green-400 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-400/20"
                >
                  {/* Post Header */}
                  <div className="p-5 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center font-bold text-black text-lg">
                          {post.postedBy?.name?.charAt(0) || "A"}
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {post.postedBy?.name || "Anonymous"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(post.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {post.isAnonymous && (
                          <span className="text-xs bg-purple-600 px-3 py-1 rounded-full">
                            Anonymous
                          </span>
                        )}
                      
                       {token && (
  <button
    onClick={() => handleDeletePost(post._id)}
    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
    title="Delete post"
  >
    <FaTrash className="text-sm" />
  </button>
)}

                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-5">
                    {post.content && (
                      <p className="text-gray-200 leading-relaxed text-base">
                        {post.content}
                      </p>
                    )}

                    {/* Media */}
                    {post.media?.url && (
                      <div className="mt-4 rounded-xl overflow-hidden bg-gray-900">
                        {post.media.type === "image" && (
                          <img
                            src={post.media.url}
                            alt="post"
                            className="w-full h-auto max-h-96 object-cover hover:scale-105 transition-transform duration-300"
                          />
                        )}

                        {post.media.type === "video" && (
                          <video
                            src={post.media.url}
                            controls
                            className="w-full max-h-96 rounded-xl"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Post Footer - Interactions */}
                  <div className="p-4 border-t border-gray-700 flex justify-around items-center bg-gray-900/50">
              <button
  onClick={() => handleLike(post._id)}
  className={`flex items-center gap-2 transition group ${
    post.likes?.includes(currentUserId)
      ? "text-red-400"
      : "text-gray-400 hover:text-red-400"
  }`}
>
  <FaHeart className="group-hover:scale-110 transition" />
  <span className="text-sm">{post.likes?.length || 0}</span>
</button>


                    <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition group">
                      <FaComment className="group-hover:scale-110 transition" />
                      <span className="text-sm">Reply</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition group">
                      <FaShare className="group-hover:scale-110 transition" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Trending & Stats */}
          <div className="w-80 flex-shrink-0 hidden lg:block space-y-5">
            {/* Trending Section */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-lg border border-gray-700">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🔥</span> Trending
              </h2>
              <div className="space-y-3">
                {["Campus Life", "Study Tips", "Projects", "Events", "News"].map(
                  (trend, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition"
                    >
                      <p className="font-semibold text-sm">#{trend}</p>
                      <p className="text-xs text-gray-400">Trending Now</p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-lg border border-gray-700">
              <h2 className="text-xl font-bold mb-4">Community Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Posts</span>
                  <span className="font-bold text-green-400">{posts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Users</span>
                  <span className="font-bold text-cyan-400">{totalUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Engagement</span>
                  <span className="font-bold text-purple-400">{totalLikes}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Community;
