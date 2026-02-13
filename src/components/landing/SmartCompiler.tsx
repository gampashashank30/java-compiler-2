
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Code2, Globe } from "lucide-react";

export const SmartCompiler = () => {
    return (
        <section className="py-24 bg-[#1a1d2e] relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-[#6C5CE7]/5 blur-3xl rounded-l-full"></div>
            <div className="absolute bottom-0 left-0 w-1/4 h-full bg-[#00cec9]/5 blur-3xl rounded-r-full"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] mb-8 border border-[#6C5CE7]/20">
                            <Zap className="w-4 h-4" />
                            <span className="text-sm font-semibold uppercase tracking-wider">Powered by Advanced AI</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
                            Smart Java Compiler <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C5CE7] to-[#00cec9]">
                                That Thinks With You
                            </span>
                        </h2>

                        <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                            Stop wrestling with cryptic errors. Our compiler doesn't just run your Java code—it understands it. Get instant, human-like explanations for every bug and suggestion.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link to="/app">
                                <Button size="lg" className="bg-[#6C5CE7] hover:bg-[#5a4ad1] text-white px-8 h-14 rounded-xl text-lg shadow-[0_4px_20px_rgba(108,92,231,0.3)] hover:shadow-[0_4px_25px_rgba(108,92,231,0.5)] transition-all duration-300">
                                    <Code2 className="mr-2 h-5 w-5" /> Open Editor
                                </Button>
                            </Link>
                            <Link to="/tutor">
                                <Button variant="outline" size="lg" className="border-gray-700 hover:bg-gray-800 text-gray-300 px-8 h-14 rounded-xl text-lg">
                                    <Globe className="mr-2 h-5 w-5" /> AI Private Tutor
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Visual/Demo Side */}
                    <div className="flex-1 w-full max-w-2xl">
                        <div className="relative rounded-2xl bg-[#151725] border border-gray-800 shadow-2xl overflow-hidden group hover:border-[#6C5CE7]/30 transition-colors duration-500">
                            {/* Window UI Header */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-[#1a1d2e]">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                </div>
                                <div className="ml-4 text-xs text-gray-500 font-mono">Main.java</div>
                            </div>

                            {/* Code Preview */}
                            <div className="p-6 font-mono text-sm leading-relaxed overflow-hidden">
                                <div className="text-blue-400">public class <span className="text-yellow-400">Main</span> {'{'}</div>
                                <div className="pl-4 text-blue-400">public static void <span className="text-yellow-400">main</span>(String[] args) {'{'}</div>
                                <div className="pl-8 text-gray-400">// Smart error detection active</div>
                                <div className="pl-8 text-white"><span className="text-purple-400">System</span>.out.println(<span className="text-green-400">"Hello Java!"</span>);</div>
                                <div className="pl-8 text-white"><span className="text-purple-400">int</span> result = <span className="text-orange-400">100</span> / <span className="text-orange-400">0</span>; <span className="text-red-500 animate-pulse"> // Logic Error Detected!</span></div>
                                <div className="pl-4 text-blue-400">{'}'}</div>
                                <div className="text-blue-400">{'}'}</div>
                            </div>

                            {/* AI Pop-up Visualization */}
                            <div className="absolute bottom-4 right-4 bg-[#6C5CE7]/10 backdrop-blur-md border border-[#6C5CE7]/20 p-4 rounded-lg max-w-sm transform translate-y-2 opacity-90">
                                <div className="flex items-start gap-3">
                                    <div className="bg-[#6C5CE7] p-1.5 rounded-lg mt-1">
                                        <Zap className="w-3 h-3 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-[#6C5CE7] font-semibold text-xs mb-1">AI Analysis</h4>
                                        <p className="text-gray-300 text-xs">Division by zero detected at line 5. This will cause an ArithmeticException at runtime.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
