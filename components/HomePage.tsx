
import React, { useState } from 'react';
import { SitemapLinkFinder } from './SitemapLinkFinder';

type NavigablePage = 'extractor' | 'compressor' | 'web-scraper';

interface HomePageProps {
    onNavigate: (page: NavigablePage) => void;
    onSitemapData?: (links: string, keyword: string) => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string, delay: string }> = ({ icon, title, description, delay }) => (
    <div className={`glass-panel p-6 rounded-2xl hover:bg-slate-800/50 transition-all duration-500 hover:-translate-y-2 border border-white/5 hover:border-sky-500/30 group opacity-0 animate-slide-up text-left ${delay}`}>
        <div className="flex items-center mb-4">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-600/20 text-sky-500 group-hover:scale-110 transition-transform duration-300 border border-sky-500/20 mr-4">
                {icon}
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-100 group-hover:text-sky-400 transition-colors">{title}</h3>
        </div>
        <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
);

const ExtractorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const AnalyzeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const GenerateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const CompressIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ScraperIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSitemapData }) => {
    const [isSitemapWidgetOpen, setIsSitemapWidgetOpen] = useState(false);

    return (
        <>
            <main className="flex-grow flex flex-col items-center justify-center text-center p-4 sm:p-6 lg:p-8 pt-24 sm:pt-32 lg:pt-40">
                <div className="max-w-5xl relative w-full">
                    
                    {/* Main Heading */}
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-white leading-tight mb-8 animate-slide-up">
                        Creating <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600">Professional</span> Cooking Recipe Content
                    </h1>
                    
                    <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 animate-slide-up" style={{animationDelay: '0.1s'}}>
                        Transform competitor content into your strategic advantage. Extract, analyze, and generate superior culinary articles that dominate search results.
                    </p>
                    
                    {/* Buttons - Organized Grid Layout */}
                    <div className="w-full max-w-4xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <button
                                onClick={() => setIsSitemapWidgetOpen(true)}
                                className="flex items-center justify-center w-full px-8 py-5 font-bold text-lg text-white bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl shadow-lg shadow-teal-600/20 hover:from-teal-500 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 transition-all duration-300 hover:-translate-y-1"
                            >
                                Sitemap Link Finder
                            </button>
                            <button
                                onClick={() => onNavigate('extractor')}
                                className="flex items-center justify-center w-full px-8 py-5 font-bold text-lg text-white bg-gradient-to-r from-sky-600 to-indigo-600 rounded-xl shadow-lg shadow-sky-600/20 hover:from-sky-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-all duration-300 hover:-translate-y-1"
                            >
                                Start Extractor Tool
                            </button>
                            <button
                                onClick={() => onNavigate('web-scraper')}
                                className="flex items-center justify-center w-full px-8 py-5 font-bold text-lg text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all duration-300 hover:-translate-y-1"
                            >
                                Web Content Extractor
                            </button>
                            <button
                                onClick={() => onNavigate('compressor')}
                                className="flex items-center justify-center w-full px-8 py-5 font-bold text-lg text-slate-200 bg-slate-800 border border-slate-700 rounded-xl shadow-lg hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-600 transition-all duration-300 hover:-translate-y-1"
                            >
                                Image Compressor
                            </button>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mt-32 max-w-7xl w-full">
                    <div className="flex items-center justify-center mb-12">
                         <h2 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">Powerful Features</h2>
                    </div>
                   
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                         <FeatureCard 
                            icon={<ScraperIcon />} 
                            title="Web Scraper"
                            description="Automatically extract clutter-free text from lists of article URLs."
                            delay="delay-[50ms]"
                        />
                        <FeatureCard 
                            icon={<ExtractorIcon />} 
                            title="Consolidate"
                            description="Combine multiple sources into a single, comprehensive text base for analysis."
                            delay="delay-[100ms]"
                        />
                        <FeatureCard 
                            icon={<AnalyzeIcon />} 
                            title="AI Analysis"
                            description="Identify themes, content gaps, and opportunities with Gemini AI."
                            delay="delay-[200ms]"
                        />
                         <FeatureCard 
                            icon={<GenerateIcon />} 
                            title="Generate Content"
                            description="Create SEO-optimized articles, social assets, and video scripts."
                            delay="delay-[300ms]"
                        />
                         <FeatureCard 
                            icon={<CompressIcon />} 
                            title="Image Tools"
                            description="Bulk compress images to improve site speed and SEO performance."
                            delay="delay-[400ms]"
                        />
                    </div>
                </div>
            </main>
            {isSitemapWidgetOpen && (
                <SitemapLinkFinder 
                    onClose={() => setIsSitemapWidgetOpen(false)} 
                    onSitemapData={onSitemapData}
                />
            )}
        </>
    );
};
