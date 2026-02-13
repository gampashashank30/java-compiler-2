
import { ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Converter = () => {
    return (
        <section className="py-24 bg-[#151725] relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Legacy Code? No Problem.</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Instantly modernize your old Java snippets or convert logic from other languages with our AI-powered refactoring engine.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
                    {/* Old Code */}
                    <div className="bg-[#1a1d2e] rounded-xl border border-gray-800 p-6 relative group">
                        <div className="absolute top-4 right-4 bg-red-500/10 text-red-500 text-xs px-2 py-1 rounded font-mono">Legacy Java</div>
                        <pre className="font-mono text-sm text-gray-400 overflow-x-auto">
                            {`// Old style headers
Vector v = new Vector();
v.add("test");
Iterator i = v.iterator();
while(i.hasNext()) {
    System.out.println(i.next());
}`}
                        </pre>
                    </div>

                    {/* Arrow (Desktop) */}
                    <div className="hidden md:flex justify-center text-[#6C5CE7]">
                        <div className="bg-[#6C5CE7]/10 p-4 rounded-full animate-pulse">
                            <ArrowRight className="w-8 h-8" />
                        </div>
                    </div>

                    {/* New Code */}
                    <div className="bg-[#1a1d2e] rounded-xl border border-[#00cec9]/30 p-6 relative shadow-[0_0_30px_rgba(0,206,201,0.1)]">
                        <div className="absolute top-4 right-4 bg-[#00cec9]/10 text-[#00cec9] text-xs px-2 py-1 rounded font-mono">Modern Java</div>
                        <pre className="font-mono text-sm text-white overflow-x-auto">
                            {`// Modern Java Collections
List<String> list = new ArrayList<>();
list.add("test");

// Enhanced for-loop
for (String s : list) {
    System.out.println(s);
}`}
                        </pre>
                        <div className="absolute -right-2 -top-2 bg-[#00cec9] rounded-full p-1">
                            <CheckCircle2 className="w-4 h-4 text-[#1a1d2e]" />
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 gap-2">
                        <RefreshCw className="w-4 h-4" /> Try Logic Converter
                    </Button>
                </div>
            </div>
        </section>
    );
};
