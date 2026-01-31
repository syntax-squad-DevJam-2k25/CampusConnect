import { Zap, Trophy, Target } from "lucide-react";

export function StatsGrid({ leetcode, codeforces }) {
    // Parsing LeetCode Data
    const lcQuestions = leetcode?.totalSolved || 0;
    const lcActiveDays = leetcode?.totalActiveDays || 0;
    const lcContests = leetcode?.totalContests || 0;

    // Parsing Codeforces Data
    const cfQuestions = codeforces?.totalSolved || 0;
    // Codeforces doesn't give active days easily, maybe just omitted or 0
    const cfContests = codeforces?.totalContests || 0;

    const stats = [
        {
            label: "Total Questions",
            value: lcQuestions + cfQuestions,
            icon: Target,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            subtext: `LC: ${lcQuestions} • CF: ${cfQuestions}`
        },
        {
            label: "Active Days",
            value: lcActiveDays, // Mainly LC active days as CF data is harder to get
            icon: Zap,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
            subtext: "LeetCode Activity"
        },
        {
            label: "Contests Attended",
            value: lcContests + cfContests,
            icon: Trophy,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            subtext: `LC: ${lcContests} • CF: ${cfContests}`
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {stats.map((stat, idx) => (
                <div key={idx} className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${stat.bg}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                        <h4 className="text-2xl font-bold text-white">{stat.value}</h4>
                        <p className="text-xs text-slate-500 mt-1">{stat.subtext}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
