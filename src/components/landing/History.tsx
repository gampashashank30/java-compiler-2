
import { Terminal, Clock, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const History = () => {
    return (
        <section className="py-24 bg-[#1a1d2e] relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Coding Timeline</h2>
                        <p className="text-gray-400">Jump back to any verify point. We autosave every successful compile.</p>
                    </div>
                    <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                        View Full History
                    </Button>
                </div>

                <div className="relative border-l border-gray-800 ml-3 space-y-8">
                    {/* Item 1 */}
                    <div className="relative pl-8 group cursor-pointer">
                        <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-[#6C5CE7] ring-4 ring-[#1a1d2e] group-hover:scale-125 transition-transform"></div>
                        <div className="bg-[#151725] p-5 rounded-xl border border-gray-800 group-hover:border-[#6C5CE7]/30 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-white font-medium flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-[#6C5CE7]" />
                                    SortAlgorithm.java
                                </h4>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> 2 mins ago
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 font-mono bg-[#1a1d2e] p-2 rounded mb-3">
                                Fixed IndexOutOfBoundsException in bubbleSort loop.
                            </p>
                            <div className="flex gap-2">
                                <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded">Compiled Success</span>
                                <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded">O(n²)</span>
                            </div>
                        </div>
                    </div>

                    {/* Item 2 */}
                    <div className="relative pl-8 group cursor-pointer">
                        <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-gray-600 ring-4 ring-[#1a1d2e] group-hover:bg-gray-500 transition-colors"></div>
                        <div className="bg-[#151725] p-5 rounded-xl border border-gray-800 group-hover:border-gray-700 transition-all opacity-75 group-hover:opacity-100">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-gray-300 font-medium flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-gray-500" />
                                    Main.java
                                </h4>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> 1 hour ago
                                </span>
                            </div>
                            <div className="flex gap-2 mb-3">
                                <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded">Runtime Error</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
