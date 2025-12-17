import React, { useEffect, useState } from 'react';
import { SavedArticle, getHistory, deleteFromHistory } from '../services/historyService';

interface ArticleHistoryPageProps {
    onSelect: (article: SavedArticle) => void;
}

export const ArticleHistoryPage: React.FC<ArticleHistoryPageProps> = ({ onSelect }) => {
    const [articles, setArticles] = useState<SavedArticle[]>([]);

    useEffect(() => {
        setArticles(getHistory());
    }, []);

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if(window.confirm("Are you sure you want to delete this article?")) {
            deleteFromHistory(id);
            setArticles(getHistory());
        }
    };

    return (
        <main className="max-w-7xl mx-auto flex-grow w-full px-4 sm:px-6 lg:px-8 py-12 pt-28 animate-fade-in">
             {articles.length === 0 ? (
                <div className="text-center text-slate-400 py-20 glass-panel rounded-2xl border-dashed border-slate-600">
                    <div className="bg-slate-800/50 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-white mb-2">No saved articles found.</h2>
                    <p className="text-slate-500">Generate an article to see it saved here automatically.</p>
                </div>
             ) : (
                <div className="space-y-4"> 
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {articles.map((article, index) => (
                            <div 
                                key={article.id}
                                onClick={() => onSelect(article)}
                                className="glass-panel p-6 rounded-xl cursor-pointer hover:bg-slate-800/80 hover:border-orange-500/30 transition-all duration-300 group relative flex flex-col animate-slide-up"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        {new Date(article.timestamp).toLocaleDateString()}
                                    </div>
                                    <div className="text-slate-500 text-xs font-mono">
                                        {new Date(article.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-serif font-bold text-slate-100 mb-2 group-hover:text-orange-400 transition-colors line-clamp-2">
                                    {(article.title === 'Untitled Article' || !article.title) 
                                        ? `Article ${articles.length - index}` 
                                        : article.title}
                                </h3>
                                
                                <div className="mb-6 pl-3 border-l-2 border-slate-700">
                                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Target Keyword</p>
                                    <p className="text-slate-300 text-sm font-medium">{article.keyword}</p>
                                </div>
                                
                                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-orange-500 text-sm font-bold flex items-center group-hover:translate-x-1 transition-transform">
                                        Open Article <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </span>
                                    <button 
                                        onClick={(e) => handleDelete(e, article.id)}
                                        className="text-slate-500 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                                        title="Delete"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                   </div>
                </div>
             )}
        </main>
    );
};