import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingPage from "../Components/LoadingPage";
import { DashboardLayout } from "../Components/DashboardLayout";

function OtherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [leetcodeData, setLeetcodeData] = useState(null);
  const [codeforcesData, setCodeforcesData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (seconds) =>
    seconds ? new Date(seconds * 1000).toLocaleDateString() : "N/A";

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = async (url, setter) => {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id }),
        });

        if (!res.ok) throw new Error("API Error");

        const data = await res.json();
        setter(data.data || null);
      } catch (err) {
        console.error(err);
        setter(null);
      }
    };

   const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      "http://localhost:5001/api/users/get-all-users",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("Failed to fetch users");

    const data = await res.json();

    console.log("ALL USERS:", data); // 👈 DEBUG

    // ✅ Find user by ID
    const foundUser = data.data.find((user) => user._id === id);

    console.log("FOUND USER:", foundUser); // 👈 DEBUG

    setUserProfile(foundUser || null);
  } catch (err) {
    console.error("Profile fetch error:", err);
    setUserProfile(null);
  }
};

    

    const fetchAll = async () => {
      try {
        await Promise.all([
          fetchData(
            "http://localhost:5001/api/users/leetcode2",
            setLeetcodeData
          ),
          fetchData(
            "http://localhost:5001/api/codeforces/getCodeforcesData2",
            setCodeforcesData
          ),
          fetchUserProfile(),
        ]);
      } catch {
        setError("Failed to fetch profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  if (loading) return (
    <DashboardLayout title="👤 User Profile" subtitle="View coding profiles and stats">
      <LoadingPage />
    </DashboardLayout>
  );

  if (error)
    return (
      <DashboardLayout title="👤 User Profile" subtitle="View coding profiles and stats">
        <p className="text-center text-red-500 mt-32 text-lg">{error}</p>
      </DashboardLayout>
    );

  return (
    <DashboardLayout title="👤 User Profile" subtitle="View coding profiles and stats">
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
        <main className="flex-grow px-6 pt-28 pb-32">
          <h1 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Coding Profiles
          </h1>

   {/* ================= USER BASIC PROFILE ================= */}
{userProfile && (
  <div className="max-w-4xl mx-auto mb-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-lg border border-gray-700">
    <div className="flex flex-col sm:flex-row items-center gap-6">
      
      {/* Profile Image (optional) */}
      <img
        src={userProfile.profileImage || "/default-avatar.png"}
        alt="Profile"
        className="w-28 h-28 rounded-full border-2 border-indigo-500 object-cover"
      />

      <div className="text-center sm:text-left">
        {/* Full Name */}
        <h2 className="text-2xl font-bold">
          {userProfile.name}
        </h2>

        {/* Username */}
        {userProfile.username && (
          <p className="text-gray-400 text-sm mt-1">
            @{userProfile.username}
          </p>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center sm:justify-start">

          {userProfile.linkedin && (
            <a
              href={userProfile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg transition"
            >
              LinkedIn
            </a>
          )}

          {userProfile.github && (
            <a
              href={userProfile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 hover:bg-gray-700 px-5 py-2 rounded-lg transition"
            >
              GitHub
            </a>
          )}

          {userProfile.resume ? (
            <a
              href={userProfile.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg transition"
            >
              View Resume
            </a>
          ) : (
            <span className="text-gray-400 text-sm mt-2">
              Resume not uploaded
            </span>
          )}

          <button
            onClick={() => navigate('/chat')}
            className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg transition"
          >
            Message
          </button>
        </div>
      </div>
    </div>
  </div>
)}


          {/* ================= CODING PROFILES ================= */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* ========== LeetCode ========== */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-lg border border-gray-700">
              <h2 className="text-2xl font-semibold text-yellow-400 mb-4 text-center">
                LeetCode Profile
              </h2>

              {leetcodeData ? (
                <>
                  <p><span className="text-gray-400">Username:</span> {leetcodeData.handler}</p>
                  <p><span className="text-gray-400">Rank:</span> {leetcodeData.rank}</p>
                  <p><span className="text-gray-400">Rating:</span> {leetcodeData.rating?.toFixed(2) || "N/A"}</p>
                  <p><span className="text-gray-400">Streak:</span> {leetcodeData.streak} days</p>
                  <p><span className="text-gray-400">Languages:</span> {leetcodeData.languagesUsed?.join(", ") || "N/A"}</p>

                  <div className="mt-6 text-center">
                    <a
                      href={leetcodeData.profileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-yellow-500 hover:bg-yellow-600 px-6 py-2 rounded-lg text-black font-medium transition"
                    >
                      View LeetCode Profile
                    </a>
                  </div>
                </>
              ) : (
                <p className="text-center text-red-400">
                  LeetCode data not available
                </p>
              )}
            </div>

            {/* ========== Codeforces ========== */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-lg border border-gray-700">
              <h2 className="text-2xl font-semibold text-blue-400 mb-4 text-center">
                Codeforces Profile
              </h2>

              {codeforcesData ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={codeforcesData.avatar}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full border-2 border-blue-500"
                    />
                    <div>
                      <h3 className="text-xl font-bold">
                        {codeforcesData.handle}
                      </h3>
                      <p className="text-green-400 capitalize">
                        {codeforcesData.rank}
                      </p>
                    </div>
                  </div>

                  <p><span className="text-gray-400">Max Rank:</span> {codeforcesData.maxRank}</p>
                  <p><span className="text-gray-400">Max Rating:</span> {codeforcesData.maxRating}</p>
                  <p><span className="text-gray-400">Contribution:</span> {codeforcesData.contribution}</p>
                  <p><span className="text-gray-400">Joined:</span> {formatDate(codeforcesData.registrationTimeSeconds)}</p>

                  <div className="mt-6 text-center">
                    <a
                      href={`https://codeforces.com/profile/${codeforcesData.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg transition"
                    >
                      View Codeforces Profile
                    </a>
                  </div>
                </>
              ) : (
                <p className="text-center text-red-400">
                  Codeforces data not available
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}

export default OtherProfile;
