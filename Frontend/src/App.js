import React, { useEffect, useState,lazy,Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess } from "./redux/userSlice";

const Home = lazy(() => import("./Components/Home.jsx"));
const Login = lazy(() => import("./Components/Login.jsx"));

const Chat = lazy(() =>import("./Pages/Chat.jsx"));

const Profile = lazy(() =>import("./Pages/Profile.jsx"));

const Community = lazy(() =>import("./Pages/Community.jsx"));

const ProfileMatching = lazy(() =>import("./Pages/ProfileMatching.jsx"));

const OtherProfile = lazy(() =>import("./Pages/OtherProfile.jsx"));

function App() {
  const user = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let storedUser = null;

    try {
      const raw = localStorage.getItem("user");
      storedUser = raw && raw !== "undefined" ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn("Invalid user in localStorage, resetting:", error);
      localStorage.removeItem("user");
      storedUser = null;
    }

    if (storedUser) {
      dispatch(loginSuccess(storedUser));
    }

    setLoading(false);
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;

  return (
    <Router>
      <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        {/* AUTH */}
        <Route
          path="/"
          element={!user ? <Login /> : <Navigate to="/home" />}
        />

        {/* MAIN PAGES */}
        <Route
          path="/home"
          element={user ? <Home /> : <Navigate to="/" />}
        />
        <Route
          path="/chat"
          element={user ? <Chat /> : <Navigate to="/" />}
        />

        {/* PROFILE FLOW */}
        <Route
          path="/profile"
          element={ user ? ( <Profile /> ) : ( <Navigate to="/" /> )}
        />
        <Route path="/community" element={user ? <Community /> : <Navigate to="/" />}  ></Route>
        <Route path="/matching" element={user ? <ProfileMatching /> : <Navigate to="/" />}  ></Route>
        {/* OTHER USER PROFILE */}
        <Route
          path="/u/:id"
          element={user ? <OtherProfile /> : <Navigate to="/" />}
        />
      </Routes>
     </Suspense>
    </Router>
  );
}

export default App;
