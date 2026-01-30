import React from "react";
import { SiLeetcode, SiCodeforces, SiGithub, SiLinkedin } from "react-icons/si";
import { CheckCircle, ExternalLink } from "lucide-react";
import { StatsGrid } from "./StatsGrid";
import { RatingChart } from "./RatingChart";
import { TopicAnalysis } from "./TopicAnalysis";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { AwardsSection } from "./AwardsSection";
import { ProblemStatsCard } from "./ProblemStatsCard";
import { ContestRankingCard } from "./ContestRankingCard";

export function ProfileInfo({ profile, leetcode, codeforces }) {
    if (!profile) return null;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* ================= LEFT COLUMN: BASIC INFO ================= */}
            <div className="xl:col-span-1 space-y-6">

                {/* PROFILE CARD */}
                <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 text-center space-y-4 shadow-xl">
                    <div className="relative inline-block">
                        <img
                            src={profile.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`}
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
                </div>

                {/* SOCIAL LINKS */}
                <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 shadow-xl">
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Social & Coding</h4>
                    <div className="space-y-2">
                        {profile.leetcodeUsername && (
                            <SocialLink
                                href={`https://leetcode.com/${profile.leetcodeUsername}`}
                                icon={SiLeetcode} label="LeetCode" color="text-[#FFA116]"
                            />
                        )}
                        {profile.codeforcesUsername && (
                            <SocialLink
                                href={`https://codeforces.com/profile/${profile.codeforcesUsername}`}
                                icon={SiCodeforces} label="Codeforces" color="text-[#1F8ACB]"
                            />
                        )}
                        {profile.github && (
                            <SocialLink href={profile.github} icon={SiGithub} label="GitHub" color="text-white" />
                        )}
                        {profile.linkedin && (
                            <SocialLink href={profile.linkedin} icon={SiLinkedin} label="LinkedIn" color="text-[#0077b5]" />
                        )}
                    </div>
                </div>

                {/* AWARDS SECTION (Moved to left col if small, or keep here) */}
                <AwardsSection leetcode={leetcode} />

            </div>

            {/* ================= RIGHT COLUMN: STATS & CHARTS ================= */}
            <div className="xl:col-span-2 space-y-6">

                {/* 1. TOP STATS GRID */}
                <StatsGrid leetcode={leetcode} codeforces={codeforces} />

                {/* 2. NEW DETAILED STATS (DSA + CONTESTS) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProblemStatsCard leetcode={leetcode} />
                    <ContestRankingCard leetcode={leetcode} codeforces={codeforces} />
                </div>

                {/* 2. RATING HISTORY */}
                <RatingChart leetcode={leetcode} codeforces={codeforces} />

                {/* 3. HEATMAP */}
                <ActivityHeatmap leetcode={leetcode} codeforces={codeforces} />

                {/* 4. STRONGEST TOPICS */}
                <TopicAnalysis leetcode={leetcode} />

            </div>
        </div>
    );
}

// Helper for social links
function SocialLink({ href, icon: Icon, label, color }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl group hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
        >
            <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${color}`} />
                <span className="text-slate-200 font-medium text-sm">{label}</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </a>
    );
}
