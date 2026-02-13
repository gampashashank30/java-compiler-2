
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2 } from 'lucide-react';

export const Hero = () => {
    return (
        <section className="pt-32 pb-20 px-6 relative overflow-hidden">
            <div className="container mx-auto text-center relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                    Master C Programming<br />with AI Guidance
                </h1>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                    The first compiler that understands your mistakes. Get instant, human-like explanations for every error.
                </p>
                <Link to="/app">
                    <button className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-all flex items-center gap-2 mx-auto">
                        Start Coding Free <ArrowRight className="w-5 h-5" />
                    </button>
                </Link>
            </div>
        </section>
    );
};
