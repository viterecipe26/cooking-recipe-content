
import React, { useState, useCallback } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { Toast } from './Toast';

interface SitemapLinkFinderProps {
    onClose: () => void;
    onSitemapData?: (links: string, keyword: string) => void;
}

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);

const CloseIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);

const parseTitleFromUrl = (url: string): string => {
    try {
        const urlObj = new URL(url);
        let titleSource: string | null = null;
        const searchParams = urlObj.searchParams;
        const queryKeywords = ['title', 'name', 'recipe', 'q', 's', 'query', 'headline'];
        for (const key of queryKeywords) {
            if (searchParams.has(key)) {
                titleSource = searchParams.get(key);
                break;
            }
        }
        if (!titleSource) {
            const path = urlObj.pathname;
            const genericSegments = new Set(['recipe', 'recipes', 'post', 'posts', 'article', 'articles', 'item', 'detail', 'view', 'blog']);
            let segments = path.split('/').filter(s => s && !s.match(/^\d+$/) && !genericSegments.has(s.toLowerCase()));
            if (segments.length > 0) {
                titleSource = segments[segments.length - 1];
            } else {
                titleSource = path.split('/').filter(Boolean).pop() || null;
            }
        }
        if (!titleSource) return url;
        
        let cleanedTitle = decodeURIComponent(titleSource);
        cleanedTitle = cleanedTitle.replace(/\.(html|php|aspx|asp|jsp|xml|htm)$/i, "");
        cleanedTitle = cleanedTitle.replace(/^[\d-]+|[\d-]+$/g, '');
        cleanedTitle = cleanedTitle.replace(/[-_.]+/g, ' ');
        cleanedTitle = cleanedTitle.replace(/\s+/g, ' ').trim();

        const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;
        const words = cleanedTitle.toLowerCase().split(' ').filter(Boolean);
        
        const titleCased = words.map((word, index) => {
            if (index === 0 || index === words.length - 1 || !smallWords.test(word)) {
                if (word.toUpperCase() === word) return word;
                return word.charAt(0).toUpperCase() + word.slice(1);
            }
            return word;
        }).join(' ');

        return titleCased.trim() || url;
    } catch (e) {
        const lastSegment = url.split('/').filter(Boolean).pop()?.split('?')[0] || '';
        if (lastSegment) {
             const withoutExtension = lastSegment.replace(/\.[^/.]+$/, "");
             const words = withoutExtension.replace(/[-_]/g, ' ').split(' ');
             const titleCased = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            return titleCased.trim() || url;
        }
        return url;
    }
};

export const SitemapLinkFinder: React.FC<SitemapLinkFinderProps> = ({ onClose, onSitemapData }) => {
    const [sitemapUrl, setSitemapUrl] = useState('https://viterecipe.com/post-sitemap.xml');
    const [keyword, setKeyword] = useState('');
    const [foundLinks, setFoundLinks] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedLinks, setCopiedLinks] = useState<Set<string>>(new Set());
    const [showToast, setShowToast] = useState(false);

    const handleFindLinks = useCallback(async (event: React.FormEvent) => {
        event.preventDefault();
        if (!sitemapUrl || !keyword) {
            setError("Please provide both a sitemap URL and a keyword.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setFoundLinks([]);
        setCopiedLinks(new Set());

        try {
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(sitemapUrl)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error(`Failed to fetch sitemap. Status: ${response.status}.`);

            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "application/xml");
            if (xmlDoc.querySelector("parsererror")) throw new Error("Failed to parse sitemap XML.");

            const locs = Array.from(xmlDoc.getElementsByTagName("loc"));
            const urls = locs.map(loc => loc.textContent || '').filter(Boolean);
            const searchTerms = keyword.trim().toLowerCase().split(/\s+/).filter(Boolean);
            if (searchTerms.length === 0) {
                setError("Please enter a valid keyword.");
                setIsLoading(false);
                return;
            }
            
            const scoredUrls = urls.map(url => {
                    const lowerUrl = url.toLowerCase();
                    if (!/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)) {
                         const score = searchTerms.reduce((acc, term) => lowerUrl.includes(term) ? acc + 1 : acc, 0);
                         return { url, score };
                    }
                    return { url, score: 0 };
                })
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score);

            const filteredUrls = scoredUrls.map(item => item.url);
            if (filteredUrls.length === 0) setError(`No links found for "${keyword}".`);
            else setFoundLinks(filteredUrls.slice(0, 5));

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [sitemapUrl, keyword]);

    const handleCopy = (link: string) => {
        navigator.clipboard.writeText(link).then(() => setCopiedLinks(prev => new Set(prev).add(link)));
    };

    const handleCopyAll = () => {
        if (foundLinks.length === 0) return;
        const linksToCopy = foundLinks.join('\n');
        navigator.clipboard.writeText(linksToCopy).then(() => {
            setCopiedLinks(new Set(foundLinks));
            setShowToast(true);
            // Delay navigation slightly to allow user to see the toast
            if (onSitemapData) {
                setTimeout(() => {
                    // Pass comma separated list for the input field
                    onSitemapData(foundLinks.join(', '), keyword);
                    onClose();
                }, 1500);
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <Toast 
                message="Internal links successfully copied! Redirecting..." 
                show={showToast} 
                onClose={() => setShowToast(false)} 
                duration={2000}
            />
            <div className="relative bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl p-8 border border-slate-700 max-h-[90vh] flex flex-col ring-1 ring-white/10">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10">
                    <CloseIcon />
                </button>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-500 mb-6">Sitemap Link Finder</h2>
                <div className="overflow-y-auto pr-2 custom-scrollbar">
                    <form onSubmit={handleFindLinks} className="space-y-5">
                        <div>
                            <label htmlFor="sitemap-url" className="sr-only">Sitemap URL</label>
                            <input
                                id="sitemap-url"
                                type="url"
                                value={sitemapUrl}
                                onChange={(e) => setSitemapUrl(e.target.value)}
                                placeholder="Enter sitemap URL"
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 transition-colors text-white placeholder-slate-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="sitemap-keyword" className="sr-only">Keyword</label>
                            <input
                                id="sitemap-keyword"
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Enter keyword (e.g., chicken soup)"
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 transition-colors text-white placeholder-slate-500"
                                required
                            />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full px-6 py-3.5 font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg shadow-lg hover:from-sky-600 hover:to-indigo-700 transition-all disabled:opacity-50">
                            {isLoading ? 'Searching...' : 'Find Links'}
                        </button>
                    </form>

                    <div className="mt-8">
                        {isLoading && <LoadingSpinner message="Parsing sitemap..." />}
                        {error && <ErrorMessage message={error} />}
                        {foundLinks.length > 0 && !isLoading && (
                            <div className="space-y-4 animate-fade-in">
                                 <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                                     <h3 className="font-semibold text-slate-300">Found {foundLinks.length} matches:</h3>
                                     <button onClick={handleCopyAll} className="flex items-center px-3 py-1.5 text-xs bg-slate-800 rounded-md text-sky-400 hover:bg-slate-700 hover:text-sky-300 transition-colors border border-slate-700">
                                        {(foundLinks.length > 0 && copiedLinks.size === foundLinks.length) ? <CheckIcon /> : <CopyIcon />}
                                        <span className="ml-1">{(foundLinks.length > 0 && copiedLinks.size === foundLinks.length) ? 'Copied' : 'Copy All'}</span>
                                     </button>
                                 </div>
                                 <ul className="space-y-3">
                                    {foundLinks.map((link, index) => {
                                        const title = parseTitleFromUrl(link);
                                        const isCopied = copiedLinks.has(link);
                                        return (
                                            <li key={index} className={`flex items-center justify-between p-4 rounded-xl transition-colors border ${isCopied ? 'bg-green-900/20 border-green-500/30' : 'bg-slate-800/50 border-slate-700 hover:border-sky-500/30'}`}>
                                                <div className="flex-grow overflow-hidden mr-4">
                                                    <p className="font-serif font-semibold text-slate-200 truncate" title={title}>{title}</p>
                                                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-sky-400/80 hover:text-sky-400 hover:underline text-xs truncate block mt-1" title={link}>{link}</a>
                                                </div>
                                                <button onClick={() => handleCopy(link)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                                                    {isCopied ? <CheckIcon /> : <CopyIcon />}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};