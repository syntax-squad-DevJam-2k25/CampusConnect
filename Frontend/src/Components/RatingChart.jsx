import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export function RatingChart({ leetcode, codeforces }) {
    // Parsing Data
    const lcHistory = leetcode?.contestHistory || [];
    const cfHistory = codeforces?.ratingHistory || [];

    // Sort by date/startTime
    const lcSorted = [...lcHistory].sort((a, b) => a.startTime - b.startTime);
    const cfSorted = [...cfHistory].sort((a, b) => a.startTime - b.startTime);

    // We need a unified X-axis (Dates) or just show them separately?
    // Showing them on same graph is hard if dates don't align perfectly.
    // Better approach: Use dates as labels and map values.

    // Actually, let's just create datasets. ChartJS handles time scale if we use 'time' scale, 
    // but to keep it simple without date adaptor, we can just use index or major events.
    // Simple approach: Just plot them. If user wants one chart, we try to merge. 
    // But they might have vastly different number of contests.
    // Let's use the most recent N contests or all of them.

    // Let's create a combined sorted list of all unique dates/timestamps to be the X-axis
    // This allows accurate plotting over time.

    const allTimestamps = new Set([
        ...lcSorted.map(c => c.startTime),
        ...cfSorted.map(c => c.startTime)
    ]);
    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

    const formattedLabels = sortedTimestamps.map(ts =>
        new Date(ts * 1000).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
    );

    // Map ratings to the timeline. We need to "hold" the previous rating if no contest on that date.
    // Or just use null for points where they didn't participate? passing 'spanGaps: true' might work better.

    const lcData = sortedTimestamps.map(ts => {
        const contest = lcSorted.find(c => c.startTime === ts);
        return contest ? contest.rating : null; // or interpolated
    });

    const cfData = sortedTimestamps.map(ts => {
        const contest = cfSorted.find(c => c.startTime === ts);
        return contest ? contest.rating : null;
    });

    const data = {
        labels: formattedLabels,
        datasets: [
            {
                label: "LeetCode",
                data: lcData,
                borderColor: "#ffa116",
                backgroundColor: "rgba(255, 161, 22, 0.2)",
                tension: 0.1,
                spanGaps: true,
                pointRadius: 3
            },
            {
                label: "Codeforces",
                data: cfData,
                borderColor: "#1f8acb",
                backgroundColor: "rgba(31, 138, 203, 0.2)",
                tension: 0.1,
                spanGaps: true,
                pointRadius: 3
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top", labels: { color: "#94a3b8" } },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        },
        scales: {
            x: {
                ticks: { color: "#94a3b8", maxTicksLimit: 10 },
                grid: { color: "#334155" },
            },
            y: {
                ticks: { color: "#94a3b8" },
                grid: { color: "#334155" },
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    return (
        <div className="bg-slate-900/80 border border-slate-700/50 p-5 rounded-xl shadow-lg w-full h-[350px]">
            <h3 className="text-lg font-semibold text-white mb-4">Rating History</h3>
            {lcHistory.length === 0 && cfHistory.length === 0 ? (
                <div className="flex items-center justify-center h-full pb-10 text-slate-500">
                    No contest history available
                </div>
            ) : (
                <div className="h-64 w-full">
                    <Line data={data} options={options} />
                </div>
            )}
        </div>
    );
}
