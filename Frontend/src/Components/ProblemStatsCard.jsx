import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export function ProblemStatsCard({ leetcode }) {
    const easy = leetcode?.easySolved || 0;
    const medium = leetcode?.mediumSolved || 0;
    const hard = leetcode?.hardSolved || 0;
    const total = leetcode?.totalSolved || 0;

    const data = {
        labels: ["Easy", "Medium", "Hard"],
        datasets: [
            {
                data: [easy, medium, hard],
                backgroundColor: ["#00b8a3", "#ffc01e", "#ef4743"], // Colors from LeetCode
                borderWidth: 0,
                hoverOffset: 4,
            },
        ],
    };

    const options = {
        cutout: "70%", // Thinner ring
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.label}: ${ctx.raw}`,
                },
            },
        },
    };

    return (
        <div className="bg-slate-900/80 border border-slate-700/50 p-6 rounded-xl shadow-lg flex flex-col justify-between">
            <h3 className="text-slate-400 font-semibold mb-4 text-center">DSA Problems</h3>

            <div className="flex items-center gap-6">
                {/* DONUT CHART */}
                <div className="relative w-32 h-32 flex-shrink-0">
                    <Doughnut data={data} options={options} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-white">{total}</span>
                        <span className="text-xs text-slate-500">Solved</span>
                    </div>
                </div>

                {/* DETAILS */}
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
                        <span className="text-sm font-medium text-[#00b8a3]">Easy</span>
                        <span className="font-bold text-white">{easy}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
                        <span className="text-sm font-medium text-[#ffc01e]">Medium</span>
                        <span className="font-bold text-white">{medium}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
                        <span className="text-sm font-medium text-[#ef4743]">Hard</span>
                        <span className="font-bold text-white">{hard}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
