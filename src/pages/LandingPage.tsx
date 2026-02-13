
import { Hero } from '@/components/landing/Hero';
import { Navbar } from '@/components/landing/Navbar';
import { SmartCompiler } from '@/components/landing/SmartCompiler';
import { StudyAssistant } from '@/components/landing/StudyAssistant';
import { MistakeTracker } from '@/components/landing/MistakeTracker';
import { Converter } from '@/components/landing/Converter'; // No text changes here as most text is in components. I'll skip this tool call for LandingPage and focus on components.
import { History } from '@/components/landing/History';
import { Footer } from '@/components/landing/Footer';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#1a1d2e] text-white font-sans selection:bg-[#6C5CE7] selection:text-white">
            <Navbar />
            <div id="features">
                <Hero />
                <SmartCompiler />
                <StudyAssistant />
                <MistakeTracker />
                <Converter />
                <History />
            </div>

            {/* Final CTA */}
            <section className="py-32 bg-[#1a1d2e] relative overflow-hidden text-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#6C5CE7] rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8">
                        Ready to Learn Smarter?
                    </h2>
                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                        Join thousands of students who have ditched frustrating errors for instant mastery.
                    </p>
                    <Link to="/app">
                        <button className="px-10 py-5 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00cec9] text-[#1a1d2e] font-bold text-xl hover:scale-105 transition-transform shadow-[0_0_50p_rgba(0,255,136,0.5)] flex items-center gap-3 mx-auto">
                            Start Coding Now <ArrowRight />
                        </button>
                    </Link>
                    <p className="mt-6 text-sm text-gray-500">No credit card required • Free for students</p>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
