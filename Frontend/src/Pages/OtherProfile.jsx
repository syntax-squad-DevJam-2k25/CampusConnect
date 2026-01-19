import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingPage from "../Components/LoadingPage";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

function OtherProfile() {
  const { id } = useParams();

  const [leetcodeData, setLeetcodeData] = useState(null);
  const [codeforcesData, setCodeforcesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (seconds) =>
    seconds ? new Date(seconds * 1000).toLocaleDateString() : "N/A";

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = async (url, setter) => {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id }),
        });

        if (!response.ok) throw new Error("API Error");

        const data = await response.json();
        setter(data.data || null);
      } catch (err) {
        console.error(err);
        setter(null);
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
        ]);
      } catch {
        setError("Failed to fetch coding profiles");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  if (loading) return <LoadingPage />;

  if (error)
    return (
      <p className="text-center text-red-500 mt-32 text-lg">{error}</p>
    );

  return (
    <>
      <Navbar />

      {/* MAIN WRAPPER */}
      <div className="flex flex-col min-h-screen bg-gray-950 text-white">

        {/* CONTENT (padding for navbar & footer) */}
        <main className="flex-grow px-6 pt-28 pb-32">
          <h1 className="text-3xl font-bold text-center mb-12">
            Coding Profiles
          </h1>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* ===================== LeetCode ===================== */}
            <div className="bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition">
              <h2 className="text-2xl font-semibold text-yellow-400 mb-4 text-center">
                LeetCode Profile
              </h2>

              {leetcodeData ? (
                <>
                  <p><span className="text-gray-400">Username:</span> {leetcodeData.handler}</p>
                  <p><span className="text-gray-400">Rank:</span> {leetcodeData.rank}</p>
                  <p>
                    <span className="text-gray-400">Rating:</span>{" "}
                    {leetcodeData.rating
                      ? leetcodeData.rating.toFixed(2)
                      : "N/A"}
                  </p>
                  <p>
                    <span className="text-gray-400">Streak:</span>{" "}
                    {leetcodeData.streak} days
                  </p>
                  <p>
                    <span className="text-gray-400">Languages:</span>{" "}
                    {leetcodeData.languagesUsed?.join(", ") || "N/A"}
                  </p>

                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Submissions</h3>
                    <ul className="space-y-1 text-sm">
                      {leetcodeData.submissionCount?.map((item, index) => (
                        <li key={index}>
                          {item.difficulty}:{" "}
                          <span className="font-medium">{item.count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

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

            {/* ===================== Codeforces ===================== */}
            <div className="bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <p><span className="text-gray-400">Max Rank:</span> {codeforcesData.maxRank}</p>
                    <p><span className="text-gray-400">Max Rating:</span> {codeforcesData.maxRating}</p>
                    <p><span className="text-gray-400">Contribution:</span> {codeforcesData.contribution}</p>
                    <p><span className="text-gray-400">Joined:</span> {formatDate(codeforcesData.registrationTimeSeconds)}</p>
                    <p><span className="text-gray-400">Last Online:</span> {formatDate(codeforcesData.lastOnlineTimeSeconds)}</p>
                  </div>

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

        <Footer />
      </div>
    </>
  );
}

export default OtherProfile;
