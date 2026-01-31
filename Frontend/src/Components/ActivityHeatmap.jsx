import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Tooltip } from "react-tooltip";

export function ActivityHeatmap({ leetcode, codeforces }) {
    // Combine Activity Data
    const lcCalendar = leetcode?.submissionCalendar || {}; // { timestamp: count }
    const cfCalendar = codeforces?.submissionCalendar || {}; // { timestamp: count }

    // Merge Data
    const allDates = {};

    // LeetCode Data (timestamps are seconds, usually)
    Object.keys(lcCalendar).forEach(ts => {
        // LC Timestamps are usually seconds, ensure consistency
        const date = new Date(parseInt(ts) * 1000).toISOString().split('T')[0];
        allDates[date] = (allDates[date] || 0) + lcCalendar[ts];
    });

    // Codeforces Data (our controller returns similar structure)
    Object.keys(cfCalendar).forEach(ts => {
        const date = new Date(parseInt(ts) * 1000).toISOString().split('T')[0];
        allDates[date] = (allDates[date] || 0) + cfCalendar[ts];
    });

    // Format for Heatmap [{ date: '2023-01-01', count: 5 }]
    const values = Object.keys(allDates).map(date => ({
        date: date,
        count: allDates[date]
    }));

    // Start from 1 year ago
    const today = new Date();
    const yearAgo = new Date();
    yearAgo.setFullYear(today.getFullYear() - 1);

    return (
        <div className="bg-slate-900/80 border border-slate-700/50 p-5 rounded-xl shadow-lg mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Submission Activity</h3>

            <div className="w-full overflow-x-auto">
                <div className="min-w-[800px]">
                    <CalendarHeatmap
                        startDate={yearAgo}
                        endDate={today}
                        values={values}
                        classForValue={(value) => {
                            if (!value) {
                                return "color-empty";
                            }
                            // Tailwind-like coloring in CSS
                            return `color-scale-${Math.min(value.count, 4)}`;
                        }}
                        tooltipDataAttrs={value => {
                            if (!value || !value.date) return null;
                            return {
                                "data-tooltip-id": "heatmap-tooltip",
                                "data-tooltip-content": `${value.date}: ${value.count} submissions`,
                            };
                        }}
                        showWeekdayLabels={true}
                    />
                    <Tooltip id="heatmap-tooltip" />
                </div>
            </div>

            {/* Legend / Info */}
            <div className="flex justify-end items-center gap-2 mt-2 text-xs text-slate-500">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 bg-[#1e293b] rounded-sm"></div>
                    <div className="w-3 h-3 bg-[#0e4429] rounded-sm"></div>
                    <div className="w-3 h-3 bg-[#006d32] rounded-sm"></div>
                    <div className="w-3 h-3 bg-[#26a641] rounded-sm"></div>
                    <div className="w-3 h-3 bg-[#39d353] rounded-sm"></div>
                </div>
                <span>More</span>
            </div>

            <style>{`
        .react-calendar-heatmap text {
          font-size: 10px;
          fill: #64748b;
        }
        .react-calendar-heatmap .color-empty {
          fill: #1e293b; 
        }
        .react-calendar-heatmap .color-scale-1 { fill: #0e4429; }
        .react-calendar-heatmap .color-scale-2 { fill: #006d32; }
        .react-calendar-heatmap .color-scale-3 { fill: #26a641; }
        .react-calendar-heatmap .color-scale-4 { fill: #39d353; }
        
        .react-calendar-heatmap rect:hover {
            stroke: #fff;
            stroke-width: 1px;
        }
      `}</style>
        </div>
    );
}
