
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { ExtractorPage } from './components/ExtractorPage';
import { CompetitorAnalyzer } from './components/CompetitorAnalyzer';
import { Footer } from './components/Footer';
import { ImageCompressor } from './components/ImageCompressor';
import { AboutPage } from './components/AboutPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { ContactPage } from './components/ContactPage';
import { PinterestPinsPage } from './components/PinterestPinsPage';
import { ArticleHistoryPage } from './components/ArticleHistoryPage';
import { GeneratedArticleDisplay } from './components/GeneratedArticleDisplay';
import { WebScraperPage } from './components/WebScraperPage';
import { SavedArticle, updateHistoryItem } from './services/historyService';
import { regenerateArticle } from './services/geminiService';

interface AnalysisData {
    keyword: string;
    content: string;
    relatedKeywords: string;
    internalLinks: string;
}

// Define valid page types
export type Page = 'home' | 'extractor' | 'analyzer' | 'compressor' | 'about' | 'privacy' | 'contact' | 'pinterest' | 'history' | 'history-viewer' | 'web-scraper';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [analyzerHasBeenActive, setAnalyzerHasBeenActive] = useState(false);
    
    // State to hold scraped data to pass to Extractor
    const [scrapedContent, setScrapedContent] = useState<string>('');
    const [scrapedInternalLinks, setScrapedInternalLinks] = useState<string>('');
    const [scrapedKeyword, setScrapedKeyword] = useState<string>('');
    
    // History viewer state
    const [historyItem, setHistoryItem] = useState<SavedArticle | null>(null);
    const [isHistoryRegenerating, setIsHistoryRegenerating] = useState(false);

    useEffect(() => {
        // If we try to go to the analyzer page without data, redirect to the extractor page.
        if (currentPage === 'analyzer' && !analysisData) {
            setCurrentPage('extractor');
        }
        // If we try to view history without an item, go back to history list
        if (currentPage === 'history-viewer' && !historyItem) {
            setCurrentPage('history');
        }
    }, [currentPage, analysisData, historyItem]);

    const handleNavigate = (page: Page) => {
        // We don't want direct navigation to 'analyzer' from navbar/homepage
        if (page !== 'analyzer' && page !== 'history-viewer') {
           setCurrentPage(page);
        }
    };

    const handleAnalysisStart = (data: AnalysisData) => {
        setAnalysisData(data);
        setAnalyzerHasBeenActive(true); // From this point, analyzer state should be preserved
        setCurrentPage('analyzer');
    };

    const handleBackToExtractor = () => {
        setCurrentPage('extractor');
    };

    const handleBackFromCompressor = () => {
        // This function is only used by the back button on the compressor page,
        // which is only visible if the user came from the analyzer flow.
        setCurrentPage('analyzer');
    };
    
    const handleScraperToExtractor = (content: string) => {
        setScrapedContent(content);
        setCurrentPage('extractor');
    };

    const handleSitemapDataTransfer = (links: string, keyword: string) => {
        setScrapedInternalLinks(links);
        setScrapedKeyword(keyword);
        setCurrentPage('extractor');
    };

    const handleHistoryRegenerate = async (feedback: string) => {
        if (!historyItem) return;
        setIsHistoryRegenerating(true);
        try {
            // Re-generate using the saved components and the current content context
            const newContent = await regenerateArticle(historyItem.components, historyItem.content, feedback);
            const updatedItem = { ...historyItem, content: newContent };
            setHistoryItem(updatedItem);
            updateHistoryItem(historyItem.id, { content: newContent });
        } catch(e) {
            console.error("Regeneration failed", e);
            // In a real app, we would set an error state here to display in the viewer
        } finally {
            setIsHistoryRegenerating(false);
        }
    };
    
    return (
        <div className="min-h-screen font-sans flex flex-col">
            <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
            <div className="flex-grow p-4 sm:p-6 lg:p-8 flex">
                <div style={{ display: currentPage === 'home' ? 'flex' : 'none' }} className="w-full h-full">
                    <HomePage onNavigate={handleNavigate} onSitemapData={handleSitemapDataTransfer} />
                </div>
                <div style={{ display: currentPage === 'web-scraper' ? 'flex' : 'none' }} className="w-full h-full">
                    <WebScraperPage onStartAnalysis={handleScraperToExtractor} />
                </div>
                <div style={{ display: currentPage === 'extractor' ? 'flex' : 'none' }} className="w-full h-full">
                    <ExtractorPage 
                        onAnalysisStart={handleAnalysisStart} 
                        initialContent={scrapedContent} 
                        initialInternalLinks={scrapedInternalLinks}
                        initialKeyword={scrapedKeyword}
                    />
                </div>
                <div style={{ display: currentPage === 'compressor' ? 'flex' : 'none' }} className="w-full h-full">
                    <main className="max-w-7xl mx-auto flex flex-col items-center space-y-8 flex-grow w-full">
                        <ImageCompressor onBack={analyzerHasBeenActive ? handleBackFromCompressor : undefined} />
                    </main>
                </div>
                 <div style={{ display: currentPage === 'analyzer' ? 'flex' : 'none' }} className="w-full h-full">
                    {/* Conditionally render the analyzer. Once active, it stays in the DOM to preserve state. */}
                    {analyzerHasBeenActive && analysisData && (
                        <CompetitorAnalyzer
                            initialKeyword={analysisData.keyword}
                            initialContent={analysisData.content}
                            initialRelatedKeywords={analysisData.relatedKeywords}
                            initialInternalLinks={analysisData.internalLinks}
                            onBack={handleBackToExtractor}
                            onNavigate={handleNavigate}
                        />
                    )}
                </div>
                 <div style={{ display: currentPage === 'pinterest' ? 'flex' : 'none' }} className="w-full h-full">
                    <PinterestPinsPage />
                </div>
                <div style={{ display: currentPage === 'history' ? 'flex' : 'none' }} className="w-full h-full">
                    <ArticleHistoryPage onSelect={(item) => { setHistoryItem(item); setCurrentPage('history-viewer'); }} />
                </div>
                <div style={{ display: currentPage === 'history-viewer' ? 'flex' : 'none' }} className="w-full h-full">
                     {historyItem && (
                        <div className="w-full max-w-6xl mx-auto">
                            <GeneratedArticleDisplay 
                                articleData={historyItem.content}
                                components={historyItem.components}
                                onBack={() => setCurrentPage('history')}
                                onRegenerate={handleHistoryRegenerate}
                                isRegenerating={isHistoryRegenerating}
                                onNavigate={handleNavigate}
                                savedArticleId={historyItem.id}
                                initialImages={historyItem.images}
                                initialPinterest={historyItem.pinterest}
                                initialYouTube={historyItem.youtube}
                                initialReels={historyItem.reelsScript}
                            />
                        </div>
                    )}
                </div>
                <div style={{ display: currentPage === 'about' ? 'flex' : 'none' }} className="w-full h-full">
                    <AboutPage />
                </div>
                <div style={{ display: currentPage === 'privacy' ? 'flex' : 'none' }} className="w-full h-full">
                    <PrivacyPolicyPage />
                </div>
                <div style={{ display: currentPage === 'contact' ? 'flex' : 'none' }} className="w-full h-full">
                    <ContactPage />
                </div>
            </div>
            <Footer onNavigate={handleNavigate} />
        </div>
    );
};

export default App;
