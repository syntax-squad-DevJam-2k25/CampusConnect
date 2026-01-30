import React from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import { SiLeetcode, SiCodeforces, SiGithub, SiLinkedin } from "react-icons/si";
import { CheckCircle, ExternalLink } from "lucide-react";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement
);

export function ProfileInfo({ profile, leetcode, codeforces }) {
    if (!profile) return null;

    /* ================= GRAPH DATA ================= */
    const leetcodeTotalSolved =
        leetcode?.submissionCount?.find((x) => x.difficulty === "All")?.count || 0;

    const codeforcesTotalSolved = codeforces?.submissionCount?.[0]?.count || 0;

    const totalSolvedGraph = {
        labels: ["LeetCode", "Codeforces"],
        datasets: [
            {
                data: [leetcodeTotalSolved, codeforcesTotalSolved],
                backgroundColor: ["#8b5cf6", "#ec4899"],
            },
        ],
    };

    const getLCCount = (diff) =>
        leetcode?.submissionCount?.find((x) => x.difficulty === diff)?.count || 0;

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
                backgroundColor: ["#8b5cf6", "#ec4899"],
            },
        ],
    };

    const chartOptions = {
        plugins: {
            legend: {
                labels: {
                    color: "#94a3b8",
                },
            },
        },
    };

    const barChartOptions = {
        ...chartOptions,
        scales: {
            y: {
                ticks: { color: "#94a3b8" },
                grid: { color: "#334155" },
            },
            x: {
                ticks: { color: "#94a3b8" },
                grid: { color: "#334155" },
            },
        },
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PROFILE CARD */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 text-center space-y-4 shadow-xl">
                <div className="relative inline-block">
                    <img
                        src={profile.profileImage || "/default-avatar.png"}
                        className="w-32 h-32 mx-auto rounded-full border-4 border-violet-500 object-cover shadow-lg shadow-violet-500/20"
                        alt="profile"
                    />
                </div>

                <h3 className="text-2xl font-bold text-white tracking-wide">{profile.name}</h3>

                <div className="space-y-2 text-slate-300">
                    <p>
                        <span className="text-slate-500 uppercase text-xs font-semibold tracking-wider">College</span> <br />
                        <span className="font-medium text-slate-200">{profile.college || "Not set"}</span>
                    </p>
                    <p>
                        <span className="text-slate-500 uppercase text-xs font-semibold tracking-wider">Branch & Year</span> <br />
                        <span className="font-medium text-slate-200">{profile.branch || "N/A"} • {profile.year || "N/A"}</span>
                    </p>
                </div>

                {/* Tags/Skills Display */}
                {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 pt-4">
                        {profile.skills.map((skill, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-slate-800 text-violet-300 text-xs font-medium rounded-full border border-slate-700/50 shadow-sm"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                {/* STATS SECTIONS */}
                <div className="w-full text-left space-y-6 mt-8">

                    {/* Problem Solving Stats */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Problem Solving Stats</h4>
                        </div>
                        <div className="space-y-2">
                            {/* LeetCode */}
                            {profile.leetcodeUsername && (
                                <a
                                    href={`https://leetcode.com/${profile.leetcodeUsername}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl group hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
                                >
                                    <div className="flex items-center gap-3">
                                        <SiLeetcode className="w-5 h-5 text-[#FFA116]" />
                                        <span className="text-slate-200 font-medium text-sm">LeetCode</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                                    </div>
                                </a>
                            )}

                            {/* Codeforces */}
                            {profile.codeforcesUsername && (
                                <a
                                    href={`https://codeforces.com/profile/${profile.codeforcesUsername}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl group hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
                                >
                                    <div className="flex items-center gap-3">
                                        <SiCodeforces className="w-5 h-5 text-[#1F8ACB]" />
                                        <span className="text-slate-200 font-medium text-sm">Codeforces</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Development Stats */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Development Stats</h4>
                        </div>
                        <div className="space-y-2">
                            {/* GitHub */}
                            {profile.github && (
                                <a
                                    href={profile.github}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl group hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
                                >
                                    <div className="flex items-center gap-3">
                                        <SiGithub className="w-5 h-5 text-white" />
                                        <span className="text-slate-200 font-medium text-sm">GitHub</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Social Profile */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Social Stats</h4>
                        </div>
                        <div className="space-y-2">
                            {/* LinkedIn */}
                            {profile.linkedin && (
                                <a
                                    href={profile.linkedin}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl group hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
                                >
                                    <div className="flex items-center gap-3">
                                        <SiLinkedin className="w-5 h-5 text-[#0077b5]" />
                                        <span className="text-slate-200 font-medium text-sm">LinkedIn</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Resume */}
                    {profile.resumeUrl && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Resume</h4>
                            </div>
                            <div className="space-y-2">
                                <a
                                    href={profile.resumeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl group hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
                                >
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <span className="text-slate-200 font-medium text-sm">View Resume</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                                    </div>
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* GRAPHS */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/80 border border-slate-700/50 p-5 rounded-xl shadow-lg">
                    <h4 className="text-center font-semibold mb-4 text-slate-200">
                        Total Problems Solved
                    </h4>
                    <div className="p-2">
                        <Doughnut data={totalSolvedGraph} options={chartOptions} />
                    </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-700/50 p-5 rounded-xl shadow-lg">
                    <h4 className="text-center font-semibold mb-4 text-slate-200">
                        LeetCode Difficulty Split
                    </h4>
                    <div className="p-2">
                        <Doughnut data={leetcodeLevelGraph} options={chartOptions} />
                    </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-700/50 p-5 rounded-xl md:col-span-2 shadow-lg">
                    <h4 className="text-center font-semibold mb-4 text-slate-200">
                        Rating Comparison
                    </h4>
                    <div className="h-64">
                        <Bar data={ratingGraph} options={{ ...barChartOptions, maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
