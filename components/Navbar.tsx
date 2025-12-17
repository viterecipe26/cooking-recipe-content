
import React, { useState } from 'react';
import { Page } from '../App';

type NavigablePage = 'home' | 'extractor' | 'compressor' | 'pinterest' | 'history' | 'web-scraper';

interface NavbarProps {
    currentPage: Page;
    onNavigate: (page: NavigablePage) => void;
}

const NavLink: React.FC<{
    page: NavigablePage;
    currentPage: Page;
    onNavigate: (page: NavigablePage) => void;
    children: React.ReactNode;
    isMobile?: boolean;
}> = ({ page, currentPage, onNavigate, children, isMobile }) => {
    const isActive = page === currentPage || 
                     (page === 'extractor' && currentPage === 'analyzer') ||
                     (page === 'history' && currentPage === 'history-viewer');
                     
    const baseClasses = "font-medium transition-all duration-300 relative group";
    // Desktop: Subtle underline effect instead of block background
    const desktopClasses = `px-1 py-2 text-sm ${isActive ? 'text-sky-400' : 'text-slate-300 hover:text-white'}`;
    const desktopActiveIndicator = isActive ? 
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"></span> : 
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-500 transition-all duration-300 group-hover:w-full rounded-full"></span>;

    // Mobile: Block style
    const mobileClasses = `block px-4 py-3 rounded-lg text-base ${isActive ? 'text-white bg-gradient-to-r from-sky-500/20 to-indigo-500/20 border-l-2 border-sky-500' : 'text-slate-300 hover:text-white hover:bg-white/5'}`;

    if (isMobile) {
        return (
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(page); }} className={`${baseClasses} ${mobileClasses}`}>
                {children}
            </a>
        );
    }

    return (
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(page); }} className={`${baseClasses} ${desktopClasses}`}>
            {children}
            {desktopActiveIndicator}
        </a>
    );
};

const HamburgerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
);

const CloseIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ChefHatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2C13.1,2 14,2.9 14,4C14,4.75 13.57,5.4 12.93,5.73C13.74,5.28 14.81,5.14 15.79,5.62C16.32,5.88 16.74,6.32 17,6.86C17.53,6.3 18.26,6 19,6C20.66,6 22,7.34 22,9C22,10.36 21.09,11.5 19.83,11.85C19.94,12.21 20,12.6 20,13V19C20,20.1 19.1,21 18,21H6C4.9,21 4,20.1 4,19V13C4,12.6 4.06,12.21 4.17,11.85C2.91,11.5 2,10.36 2,9C2,7.34 3.34,6 5,6C5.74,6 6.47,6.3 7,6.86C7.26,6.32 7.68,5.88 8.21,5.62C9.19,5.14 10.26,5.28 11.07,5.73C10.43,5.4 10,4.75 10,4C10,2.9 10.9,2 12,2M6,13V19H18V13H6Z" />
    </svg>
);

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const handleMobileNavigate = (page: NavigablePage) => {
        onNavigate(page);
        setIsMenuOpen(false);
    };

    return (
        <nav className="fixed top-0 w-full z-50 glass-panel border-b-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <a href="#" onClick={(e) => {e.preventDefault(); onNavigate('home');}} className="flex items-center gap-3 group">
                            <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl shadow-lg transform group-hover:scale-110 transition-all duration-300">
                                <ChefHatIcon />
                            </div>
                            <a href="#" onClick={(e) => {e.preventDefault(); onNavigate('home');}} className="hidden md:flex items-center text-2xl font-serif font-bold tracking-wide text-white group-hover:text-sky-100 transition-colors duration-300">
                                <span>VITE</span>
                                <div className="mx-1.5 w-6 h-6 flex items-center justify-center">
                                    <ChefHatIcon />
                                </div>
                                <span className="text-sky-500">RECIPE</span>
                            </a>
                        </a>
                    </div>
                    
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center">
                        <div className="flex items-baseline space-x-6 lg:space-x-8">
                            <NavLink page="home" currentPage={currentPage} onNavigate={onNavigate}>Home</NavLink>
                            <NavLink page="web-scraper" currentPage={currentPage} onNavigate={onNavigate}>Web Scraper</NavLink>
                            <NavLink page="extractor" currentPage={currentPage} onNavigate={onNavigate}>Extractor Tool</NavLink>
                            <NavLink page="history" currentPage={currentPage} onNavigate={onNavigate}>History</NavLink>
                            <NavLink page="pinterest" currentPage={currentPage} onNavigate={onNavigate}>Pinterest Pins</NavLink>
                            <NavLink page="compressor" currentPage={currentPage} onNavigate={onNavigate}>Image Compressor</NavLink>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
                            aria-expanded={isMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden glass-panel border-t border-white/10" id="mobile-menu">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <NavLink page="home" currentPage={currentPage} onNavigate={handleMobileNavigate} isMobile={true}>Home</NavLink>
                        <NavLink page="web-scraper" currentPage={currentPage} onNavigate={handleMobileNavigate} isMobile={true}>Web Scraper</NavLink>
                        <NavLink page="extractor" currentPage={currentPage} onNavigate={handleMobileNavigate} isMobile={true}>Extractor Tool</NavLink>
                        <NavLink page="history" currentPage={currentPage} onNavigate={handleMobileNavigate} isMobile={true}>History</NavLink>
                        <NavLink page="pinterest" currentPage={currentPage} onNavigate={handleMobileNavigate} isMobile={true}>Pinterest Pins</NavLink>
                        <NavLink page="compressor" currentPage={currentPage} onNavigate={handleMobileNavigate} isMobile={true}>Image Compressor</NavLink>
                    </div>
                </div>
            )}
        </nav>
    );
};