import { format } from "date-fns";

export function AwardsSection({ leetcode }) {
    const badges = leetcode?.badges || [];

    return (
        <div className="bg-slate-900/80 border border-slate-700/50 p-5 rounded-xl shadow-lg mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Badges & Awards</h3>

            {badges.length === 0 ? (
                <p className="text-slate-500 text-center py-6">No badges earned yet.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {badges.map((badge, idx) => (
                        <div key={idx} className="flex flex-col items-center p-3 bg-slate-800/40 rounded-lg hover:bg-slate-800 transition-colors group">
                            <div className="relative w-16 h-16 mb-2">
                                {badge.icon.startsWith("http") ? (
                                    <img src={badge.icon} alt={badge.displayName} className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform" />
                                ) : (
                                    // Fallback or icon font if needed
                                    <div className="w-full h-full bg-slate-700 rounded-full flex items-center justify-center text-xs">No Icon</div>
                                )}
                            </div>
                            <span className="text-xs font-medium text-slate-300 text-center leading-tight">
                                {badge.displayName}
                            </span>
                            {badge.creationDate && (
                                <span className="text-[10px] text-slate-500 mt-1">
                                    {format(new Date(badge.creationDate), "MMM yyyy")}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
