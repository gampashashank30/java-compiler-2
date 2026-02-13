
import { XCircle, AlertTriangle, CheckCircle } from "lucide-react";

export const MistakeTracker = () => {
    return (
        <section className="py-24 bg-[#1a1d2e]">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Track Your Growth</h2>
                        <p className="text-gray-400">We don't just compile; we remember your common pitfalls so you stop making them.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Error Card 1 */}
                    <div className="bg-[#151725] p-6 rounded-xl border border-gray-800 hover:border-red-500/30 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                <XCircle className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-mono text-gray-500">Freq: High</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">NullPointerException</h3>
                        <p className="text-sm text-gray-400 mb-4">You often forget to check for null before calling methods on objects.</p>
                        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-red-500 w-[75%] h-full"></div>
                        </div>
                    </div>

                    {/* Error Card 2 */}
                    <div className="bg-[#151725] p-6 rounded-xl border border-gray-800 hover:border-yellow-500/30 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-mono text-gray-500">Freq: Medium</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Infinite Loops</h3>
                        <p className="text-sm text-gray-400 mb-4">30% of your while-loops missed a termination condition last week.</p>
                        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-yellow-500 w-[40%] h-full"></div>
                        </div>
                    </div>

                    {/* Success Card 3 */}
                    <div className="bg-[#151725] p-6 rounded-xl border border-gray-800 hover:border-green-500/30 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-mono text-gray-500">Improvement</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Syntax Mastery</h3>
                        <p className="text-sm text-gray-400 mb-4">You've reduced missing semicolon errors by 90% this month!</p>
                        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-green-500 w-[90%] h-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
