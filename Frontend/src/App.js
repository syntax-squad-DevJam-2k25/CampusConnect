import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Home from "./Components/Home.jsx";
import Login from "./Components/Login.jsx";
import Chat from "./Pages/Chat.jsx";
import { loginSuccess } from "./redux/userSlice";
import Profile from "./Components/Profile.jsx";
import OtherProfile from "./Pages/OtherProfile.jsx";

function App() {
  const user = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      dispatch(loginSuccess(storedUser));
    }
    setLoading(false);
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;

  return (
    <Router> 
      <Routes> 
        <Route path="/" element={!user ? <Login /> : <Navigate to="/home" />} />
        <Route path="/home" element={user ? <Home /> : <Navigate to="/" />} />
        <Route path="/chat" element={user ? <Chat /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
        <Route path="/u/:id" element={user ? <OtherProfile /> : <Navigate to="/" />} />
        </Routes>
    </Router>
  );
}

export default App;