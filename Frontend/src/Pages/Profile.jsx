import { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function Profile() {
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    name: "",
    college: "",
    branch: "",
    year: "",
    githubLink: "",
    linkedinLink: "",
    leetcodeLink: "",
    codeforcesLink: "",
  });

  const [leetcode, setLeetcode] = useState(null);
  const [codeforces, setCodeforces] = useState(null);

  /* ================= FETCH PROFILE ================= */
  const fetchProfile = async () => {
    const res = await fetch("http://localhost:5001/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    setProfile(data.data);

    setForm({
      name: data.data.name || "",
      college: data.data.college || "",
      branch: data.data.branch || "",
      year: data.data.year || "",
      githubLink: data.data.github || "",
      linkedinLink: data.data.linkedin || "",
      leetcodeLink: data.data.leetcodeUsername || "",
      codeforcesLink: data.data.codeforcesUsername || "",
    });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ================= FETCH CODING DATA ================= */
  useEffect(() => {
    fetch("http://localhost:5001/api/users/leetcode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(res => setLeetcode(res.data));

    fetch("http://localhost:5001/api/codeforces/getCodeforcesData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(res => setCodeforces(res.data));
  }, []);

  /* ================= UPDATE PROFILE ================= */
  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    if (e.target.profileImage?.files[0]) {
      fd.append("profileImage", e.target.profileImage.files[0]);
    }

    if (e.target.resume?.files[0]) {
      fd.append("resume", e.target.resume.files[0]);
    }

    await fetch("http://localhost:5001/api/users/update-profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    await fetchProfile();
    setEditMode(false);
  };

  if (!profile) return <p className="text-center mt-32">Loading...</p>;

  /* ================= GRAPH DATA ================= */
  const leetcodeTotalSolved =
    leetcode?.submissionCount?.find(x => x.difficulty === "All")?.count || 0;

  const codeforcesTotalSolved =
    codeforces?.submissionCount?.[0]?.count || 0;

  const totalSolvedGraph = {
    labels: ["LeetCode", "Codeforces"],
    datasets: [
      {
        data: [leetcodeTotalSolved, codeforcesTotalSolved],
        backgroundColor: ["#6366f1", "#ec4899"],
      },
    ],
  };

  const getLCCount = diff =>
    leetcode?.submissionCount?.find(x => x.difficulty === diff)?.count || 0;

  const leetcodeLevelGraph = {
    labels: ["Easy", "Medium", "Hard"],
    datasets: [
      {
        data: [getLCCount("Easy"), getLCCount("Medium"), getLCCount("Hard")],
        backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
      },
    ],
  };

  const ratingGraph = {
    labels: ["LeetCode", "Codeforces"],
    datasets: [
      {
        label: "Rating",
        data: [leetcode?.rating || 0, codeforces?.rating || 0],
        backgroundColor: ["#6366f1", "#ec4899"],
      },
    ],
  };

  return (
    <>
      <Navbar />

      <div className="pt-24 pb-32 bg-gradient-to-br from-indigo-100 to-pink-100 min-h-screen">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-10">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold text-indigo-600">My Profile</h2>
            <button
              onClick={() => {
                setEditMode(!editMode);
                setTimeout(() => {
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: "smooth",
                  });
                }, 200);
              }}
              className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
            >
              {editMode ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {/* PROFILE + GRAPHS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            {/* PROFILE */}
            <div className="text-center space-y-4 p-6 rounded-2xl bg-gray-50 shadow">
              <img
                src={profile.profileImage || "/default-avatar.png"}
                className="w-32 h-32 mx-auto rounded-full border-4 border-indigo-500"
                alt="profile"
              />

              <h3 className="text-2xl font-bold">{profile.name}</h3>

              <p>
                <span className="font-semibold">College:</span>{" "}
                {profile.college}
              </p>

              <p>
                <span className="font-semibold">Branch:</span>{" "}
                {profile.branch}
              </p>

              <p>
                <span className="font-semibold">Year:</span>{" "}
                {profile.year}
              </p>

              <div className="flex justify-center gap-4 mt-4 flex-wrap">
                {profile.github && (
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg"
                  >
                    GitHub
                  </a>
                )}

                {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    LinkedIn
                  </a>
                )}

                {profile.resumeUrl && (
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg"
                  >
                    Resume
                  </a>
                )}
              </div>
            </div>

            {/* GRAPHS */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-4 rounded-xl shadow">
                <h4 className="text-center font-semibold mb-2">
                  Total Solved
                </h4>
                <Doughnut data={totalSolvedGraph} />
              </div>

              <div className="bg-gray-50 p-4 rounded-xl shadow">
                <h4 className="text-center font-semibold mb-2">
                  LeetCode Difficulty
                </h4>
                <Doughnut data={leetcodeLevelGraph} />
              </div>

              <div className="bg-gray-50 p-4 rounded-xl shadow md:col-span-2">
                <h4 className="text-center font-semibold mb-2">
                  Rating Comparison
                </h4>
                <Bar data={ratingGraph} />
              </div>
            </div>
          </div>

          {/* ================= EDIT FORM (SEPARATE CARD) ================= */}
          {editMode && (
            <div className="mt-24 bg-white rounded-3xl shadow-2xl p-10">
              <h3 className="text-2xl font-bold text-indigo-600 mb-8">
                Edit Profile
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" />
                  <input className="input" name="college" value={form.college} onChange={handleChange} placeholder="College Name" />
                  <input className="input" name="branch" value={form.branch} onChange={handleChange} placeholder="Branch (eg: MCA)" />
                  <input className="input" name="year" value={form.year} onChange={handleChange} placeholder="Passing Year" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="file" name="profileImage" />
                  <input type="file" name="resume" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="input" name="githubLink" value={form.githubLink} onChange={handleChange} placeholder="GitHub URL" />
                  <input className="input" name="linkedinLink" value={form.linkedinLink} onChange={handleChange} placeholder="LinkedIn URL" />
                  <input className="input" name="leetcodeLink" value={form.leetcodeLink} onChange={handleChange} placeholder="LeetCode Username" />
                  <input className="input" name="codeforcesLink" value={form.codeforcesLink} onChange={handleChange} placeholder="Codeforces Username" />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                  >
                    Save Changes
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
}
