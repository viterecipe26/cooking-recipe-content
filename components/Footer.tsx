import React from 'react';

type NavigableFooterPage = 'about' | 'privacy' | 'contact';

interface FooterProps {
    onNavigate: (page: NavigableFooterPage) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    return (
        <footer className="w-full mt-12 py-6 border-t border-slate-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-slate-500 space-y-4 sm:space-y-0">
                <p className="text-center sm:text-left">&copy; 2025 Created by HZ. All Rights Reserved.</p>
                <div className="flex justify-center space-x-6">
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('about'); }} className="hover:text-slate-300 transition-colors">About</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }} className="hover:text-slate-300 transition-colors">Privacy Policy</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }} className="hover:text-slate-300 transition-colors">Contact</a>
                </div>
            </div>
        </footer>
    );
};