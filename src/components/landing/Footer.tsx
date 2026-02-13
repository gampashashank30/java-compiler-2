
import React from 'react';

export const Footer = () => {
    return (
        <footer className="py-12 bg-[#0d0f1b] border-t border-white/5">
            <div className="container mx-auto px-6 flex justify-between items-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} C Compiler Studio. All rights reserved.</p>
                <div className="flex gap-4">
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                </div>
            </div>
        </footer>
    );
};
