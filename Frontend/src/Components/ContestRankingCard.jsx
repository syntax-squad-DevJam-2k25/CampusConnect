import { SiLeetcode, SiCodeforces } from "react-icons/si";

export function ContestRankingCard({ leetcode, codeforces }) {
    // LeetCode Stats
    const lcRating = Math.round(leetcode?.contestRating || 0);
    const lcMaxRating = Math.round(leetcode?.contestMaxRating || 0);
    const lcBadge = leetcode?.contestBadge; // { name: "Guardian", ... }
    // const lcRank = leetcode?.contestGlobalRank || "N/A"; // Global rank often confusing, let's use Rating 

    // Codeforces Stats
    const cfRating = codeforces?.rating || 0;
    const cfMaxRating = codeforces?.maxRating || 0;
    const cfRankStr = codeforces?.rank || "unrated"; // e.g. "pupil"

    // Function to get rank color for Codeforces
    const getCfColor = (rank) => {
        if (!rank) return "text-slate-400";
        rank = rank.toLowerCase();
        if (rank.includes("grandmaster")) return "text-red-500";
        if (rank.includes("master")) return "text-orange-500"; // or bright yellow/orange
        if (rank.includes("candidate")) return "text-violet-500";
        if (rank.includes("expert")) return "text-blue-500";
        if (rank.includes("specialist")) return "text-cyan-500";
        if (rank.includes("pupil")) return "text-green-500";
        if (rank.includes("newbie")) return "text-slate-400";
        return "text-slate-200";
    };

    return (
        <div className="bg-slate-900/80 border border-slate-700/50 p-6 rounded-xl shadow-lg flex flex-col">
            <h3 className="text-slate-400 font-semibold mb-6 text-center">Contest Rankings</h3>

            <div className="flex-1 flex flex-col justify-center gap-8">

                {/* LEETCODE ROW */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#ffa116]/10 rounded-lg">
                            <SiLeetcode className="w-6 h-6 text-[#ffa116]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-300 font-medium tracking-wide">LEETCODE</span>
                            {/* Display Badge Name if exists (e.g. Knight, Guardian) */}
                            {lcBadge && (
                                <span className="text-xs font-bold uppercase text-[#ffa116]">{lcBadge.name}</span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">{lcRating}</div>
                        <div className="text-xs text-slate-500">max: {lcMaxRating}</div>
                    </div>
                </div>

                {/* CODEFORCES ROW */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#1f8acb]/10 rounded-lg">
                            <SiCodeforces className="w-6 h-6 text-[#1f8acb]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-300 font-medium tracking-wide">CODEFORCES</span>
                            <span className={`text-xs font-bold uppercase ${getCfColor(cfRankStr)}`}>{cfRankStr}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-2xl font-bold ${getCfColor(cfRankStr)}`}>{cfRating}</div>
                        <div className="text-xs text-slate-500">max: {cfMaxRating}</div>
                    </div>
                </div>

                {/* FUTURE: CODECHEF or others */}

            </div>
        </div>
    );
}
