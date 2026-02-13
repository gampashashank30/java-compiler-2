
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

export const Navbar = () => {
    return (
        <nav className="w-full border-b border-white/10 bg-[#1a1d2e]/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <Link to="/" className="text-xl font-bold text-white">
                    C Compiler Studio
                </Link>
                <div className="flex items-center gap-4">
                    <Link to="/app">
                        <Button variant="default">Launch App</Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};
