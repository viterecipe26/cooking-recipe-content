
import React, { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { scrapeArticles, ScrapedArticle } from '../services/scraperService';

interface WebScraperPageProps {
  onStartAnalysis: (content: string) => void;
}

const LinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
);

export const WebScraperPage: React.FC<WebScraperPageProps> = ({ onStartAnalysis }) => {
  const [urls, setUrls] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [results, setResults] = useState<ScrapedArticle[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    const urlList = urls.split('\n').map(u => u.trim()).filter(u => u);
    
    if (urlList.length === 0) {
      setError("Please enter at least one URL.");
      return;
    }

    setIsExtracting(true);
    setError(null);
    setResults(null);

    try {
      const data = await scrapeArticles(urlList);
      setResults(data);
    } catch (err) {
      setError("An unexpected error occurred during extraction.");
    } finally {
      setIsExtracting(false);
    }
  };

  const getCombinedContent = () => {
    if (!results) return '';
    return results
      .filter(r => r.status === 'success')
      .map(r => `--- SOURCE: ${r.url} ---\nTITLE: ${r.title}\n\n${r.content}`)
      .join('\n\n========================================\n\n');
  };

  const handleDownload = () => {
    const content = getCombinedContent();
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'extracted_content.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleProceed = () => {
    const content = getCombinedContent();
    if (content) {
      onStartAnalysis(content);
    }
  };

  return (
    <main className="max-w-4xl mx-auto flex-grow w-full px-4 sm:px-6 lg:px-8 py-12 pt-28 animate-fade-in">
        <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 mb-4">
                Web Content Extractor
            </h1>
            <p className="text-lg text-slate-400">
                Bulk extract text from article URLs to remove clutter and prepare for analysis.
            </p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-2xl p-6 md:p-8 border border-slate-700">
            <form onSubmit={handleExtract} className="space-y-6">
                <div>
                    <label htmlFor="urls" className="block text-lg font-semibold text-sky-400 mb-2 flex items-center">
                        <LinkIcon /> Article Links
                    </label>
                    <textarea
                        id="urls"
                        value={urls}
                        onChange={(e) => setUrls(e.target.value)}
                        placeholder="Paste article URLs here (one per line)..."
                        rows={6}
                        className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 text-slate-200 placeholder-slate-500 font-mono text-sm"
                        required
                    />
                </div>

                {error && <ErrorMessage message={error} />}

                <button
                    type="submit"
                    disabled={isExtracting}
                    className="w-full py-4 font-bold text-lg text-white bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg shadow-lg hover:from-sky-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-all duration-300 disabled:opacity-50"
                >
                    {isExtracting ? 'Extracting Content...' : 'Extract Content'}
                </button>
            </form>

            {isExtracting && <LoadingSpinner message="Visiting URLs and extracting content..." />}

            {results && !isExtracting && (
                <div className="mt-10 pt-10 border-t border-slate-700 animate-fade-in">
                    <h3 className="text-2xl font-bold text-slate-200 mb-6">Extraction Results</h3>
                    
                    <div className="space-y-3 mb-8">
                        {results.map((r, i) => (
                            <div key={i} className={`p-4 rounded-lg border ${r.status === 'success' ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                                <div className="flex justify-between items-start">
                                    <div className="overflow-hidden">
                                        <p className="font-semibold text-slate-200 truncate">{r.url}</p>
                                        <p className="text-sm text-slate-400 mt-1">{r.status === 'success' ? `Success - ${r.title}` : `Failed - ${r.error}`}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${r.status === 'success' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                        {r.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleDownload}
                            className="flex-1 flex items-center justify-center px-6 py-3 font-semibold text-white bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                        >
                            <DownloadIcon /> Download .txt
                        </button>
                        <button
                            onClick={handleProceed}
                            className="flex-1 flex items-center justify-center px-6 py-3 font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 rounded-lg shadow-lg hover:from-teal-600 hover:to-emerald-700 transition-all"
                        >
                            Start Extraction Tool <ArrowRightIcon />
                        </button>
                    </div>
                </div>
            )}
        </div>
    </main>
  );
};