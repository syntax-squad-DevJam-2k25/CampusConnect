import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export function TopicAnalysis({ leetcode }) {
    const topics = leetcode?.topicStats || { advanced: [], intermediate: [], fundamental: [] };

    // Flatten and process data
    // Let's take top 10 topics overall or categorize them
    // For simplicity, let's just show top 15 topics across all categories sorted by count

    const allTopics = [
        ...topics.advanced.map(t => ({ ...t, type: 'Advanced' })),
        ...topics.intermediate.map(t => ({ ...t, type: 'Intermediate' })),
        ...topics.fundamental.map(t => ({ ...t, type: 'Fundamental' }))
    ];

    const sortedTopics = allTopics.sort((a, b) => b.problemsSolved - a.problemsSolved).slice(0, 10);

    const data = {
        labels: sortedTopics.map(t => t.tagName),
        datasets: [{
            label: 'Problems Solved',
            data: sortedTopics.map(t => t.problemsSolved),
            backgroundColor: sortedTopics.map(t => {
                if (t.type === 'Advanced') return '#ef4444'; // Red
                if (t.type === 'Intermediate') return '#facc15'; // Yellow
                return '#22c55e'; // Green
            }),
            borderRadius: 4
        }]
    };

    const options = {
        indexAxis: 'y', // Horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const topic = sortedTopics[context.dataIndex];
                        return `${topic.type}: ${context.raw} solved`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { color: "#334155" },
                ticks: { color: "#94a3b8" }
            },
            y: {
                grid: { display: false },
                ticks: { color: "#e2e8f0", font: { size: 12 } }
            }
        }
    };

    return (
        <div className="bg-slate-900/80 border border-slate-700/50 p-5 rounded-xl shadow-lg h-[400px]">
            <h3 className="text-lg font-semibold text-white mb-4">Strongest Topics</h3>
            {sortedTopics.length === 0 ? (
                <p className="text-slate-500 text-center mt-10">No topic data available</p>
            ) : (
                <div className="h-[320px]">
                    <Bar data={data} options={options} />
                </div>
            )}
        </div>
    );
}
