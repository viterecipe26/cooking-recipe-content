
import React, { useState, useEffect, useRef } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { 
    ArticleComponents, 
    compareArticleWithCompetitors, 
    AllImageDetails, 
    generateImagePromptsAndMetadata, 
    BillingRequiredError,
    AllPinterestContent,
    generatePinterestContent,
    generateYouTubeScript,
    generateReelsScript
} from '../services/geminiService';
import { updateHistoryItem, SavedArticle } from '../services/historyService';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { ArticleImagesDisplay } from './ArticleImagesDisplay';
import { PinterestDisplay } from './PinterestDisplay';
import { Toast } from './Toast';

type Page = 'home' | 'extractor' | 'analyzer' | 'compressor' | 'about' | 'privacy' | 'contact';

interface ParsedArticleData {
    articleTitle: string;
    mainArticle: string;
    titleTags: string[];
    metaDescriptions: string[];
    recipeRecap: string;
    category: string;
    recipeJson: string;
}

const parseArticleData = (data: string): ParsedArticleData => {
    let mainArticleContent = data.match(/\[ARTICLE_START\]([\s\S]*?)\[ARTICLE_END\]/)?.[1]?.trim() || '';
    let articleTitle = '';

    const titleMatch = mainArticleContent.match(/^#\s+(.*)/);
    if (titleMatch && titleMatch[1]) {
        articleTitle = titleMatch[1]; // Capture the text after '# '
        mainArticleContent = mainArticleContent.substring(titleMatch[0].length).trim();
    }
    
    const titleTagsBlock = data.match(/\[TITLE_TAGS_START\]([\s\S]*?)\[TITLE_TAGS_END\]/)?.[1]?.trim() || '';
    const metaDescriptionsBlock = data.match(/\[META_DESCRIPTIONS_START\]([\s\S]*?)\[META_DESCRIPTIONS_END\]/)?.[1]?.trim() || '';
    const recipeRecap = data.match(/\[RECIPE_RECAP_START\]([\s\S]*?)\[RECIPE_RECAP_END\]/)?.[1]?.trim() || '';
    const category = data.match(/\[CATEGORY_START\]([\s\S]*?)\[CATEGORY_END\]/)?.[1]?.trim() || '';
    const recipeJson = data.match(/\[RECIPE_JSON_START\]([\s\S]*?)\[RECIPE_JSON_END\]/)?.[1]?.trim() || '';

    return {
        articleTitle,
        mainArticle: mainArticleContent,
        titleTags: titleTagsBlock.split('\n').map(t => t.replace(/^\d+\.\s*/, '').trim()).filter(Boolean),
        metaDescriptions: metaDescriptionsBlock.split('\n').map(d => d.replace(/^\d+\.\s*/, '').trim()).filter(Boolean),
        recipeRecap,
        category,
        recipeJson,
    };
};

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const CopyableList: React.FC<{ title: string; items: string[] }> = ({ title, items }) => {
  const [isCopied, setIsCopied] = useState(false);
  const handleCopy = () => {
    if (!items || items.length === 0) return;
    navigator.clipboard.writeText(items.join('\n')).then(() => {
        setIsCopied(true);
    });
  };

  return (
    <div className={`relative p-6 rounded-lg border border-gray-700 transition-colors ${isCopied ? 'bg-green-900/50' : 'bg-gray-800/60'}`}>
      <h4 className="text-xl font-semibold text-sky-400 mb-3">{title}</h4>
      <button
        onClick={handleCopy}
        className={`absolute top-4 right-4 flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
          isCopied
            ? 'bg-green-600/80 text-white'
            : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600/90'
        }`}
        aria-label={`Copy ${title}`}
      >
        {isCopied ? <CheckIcon /> : <CopyIcon />}
        {isCopied ? 'Copied!' : 'Copy'}
      </button>
      <ul className="space-y-2 text-gray-300">
        {items.map((item, index) => (
          <li key={index} className="pl-4 border-l-2 border-gray-600 leading-relaxed">{item}</li>
        ))}
      </ul>
    </div>
  );
};

const CopyableBlock: React.FC<{ title: string; content: string; isJson?: boolean }> = ({ title, content, isJson = false }) => {
    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = () => {
        if (!content) return;
        navigator.clipboard.writeText(content).then(() => {
            setIsCopied(true);
        });
    };
    return (
        <div className={`relative p-6 rounded-lg border border-gray-700 transition-colors ${isCopied ? 'bg-green-900/50' : 'bg-gray-800/60'}`}>
            <h4 className="text-xl font-semibold text-sky-400 mb-3">{title}</h4>
             <button
                onClick={handleCopy}
                className={`absolute top-4 right-4 flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                isCopied
                    ? 'bg-green-600/80 text-white'
                    : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600/90'
                }`}
                aria-label={`Copy ${title}`}
            >
                {isCopied ? <CheckIcon /> : <CopyIcon />}
                {isCopied ? 'Copied!' : 'Copy'}
            </button>
            <pre className={`whitespace-pre-wrap text-gray-300 leading-relaxed ${isJson ? 'font-mono' : 'font-sans'}`}>{isJson ? JSON.stringify(JSON.parse(content), null, 2) : content}</pre>
        </div>
    );
};


interface GeneratedArticleDisplayProps {
    articleData: string;
    components: ArticleComponents;
    onBack: () => void;
    onRegenerate: (feedback: string) => void;
    isRegenerating: boolean;
    onNavigate: (page: Page) => void;
    savedArticleId?: string;
    initialImages?: AllImageDetails;
    initialPinterest?: AllPinterestContent;
    initialYouTube?: string;
    initialReels?: string;
}

export const GeneratedArticleDisplay: React.FC<GeneratedArticleDisplayProps> = ({ 
    articleData, 
    components, 
    onBack, 
    onRegenerate, 
    isRegenerating, 
    onNavigate,
    savedArticleId,
    initialImages,
    initialPinterest,
    initialYouTube,
    initialReels
}) => {
    const [activeTab, setActiveTab] = useState<'article' | 'analysis' | 'images' | 'pinterest' | 'youtube' | 'reels'>('article');
    const [parsedData, setParsedData] = useState<ParsedArticleData | null>(null);
    const [comparisonResult, setComparisonResult] = useState<string | null>(null);
    const [isComparing, setIsComparing] = useState(false);
    const [comparisonError, setComparisonError] = useState<string | null>(null);
    const [isBillingError, setIsBillingError] = useState(false);

    const [imageData, setImageData] = useState<AllImageDetails | null>(initialImages || null);
    const [isGeneratingImages, setIsGeneratingImages] = useState(false);
    const [imageError, setImageError] = useState<string|null>(null);

    const [pinterestData, setPinterestData] = useState<AllPinterestContent | null>(initialPinterest || null);
    const [isGeneratingPinterest, setIsGeneratingPinterest] = useState(false);
    const [pinterestError, setPinterestError] = useState<string|null>(null);
    
    const [youTubeScript, setYouTubeScript] = useState<string | null>(initialYouTube || null);
    const [isGeneratingYouTube, setIsGeneratingYouTube] = useState(false);
    const [youTubeError, setYouTubeError] = useState<string|null>(null);

    const [reelsScript, setReelsScript] = useState<string | null>(initialReels || null);
    const [isGeneratingReels, setIsGeneratingReels] = useState(false);
    const [reelsError, setReelsError] = useState<string|null>(null);
    
    const [toastMessage, setToastMessage] = useState('');

    const [isArticleCopied, setIsArticleCopied] = useState(false);

    const analysisTabRef = useRef<HTMLButtonElement>(null);
    const isInitialRender = useRef(true);


    useEffect(() => {
        try {
            const data = parseArticleData(articleData);
            setParsedData(data);
             if (!isInitialRender.current) {
                showToast("Article has been successfully regenerated!");
            }
        } catch (e) {
            console.error("Failed to parse article data:", e);
            setComparisonError("Failed to parse the generated article format.");
        }
    }, [articleData]);
    
    useEffect(() => {
        // Reset comparison secondary states when article data changes
        // Note: We DO NOT reset images/pinterest/youtube/reels here because they might be persisted or we want to keep them
        setComparisonResult(null);
        setComparisonError(null);
        setIsBillingError(false);
        setActiveTab('article');
        
        // Mark initial render as false after the first run
        isInitialRender.current = false;
    }, [articleData]);
    
    // Update state if initial props change (e.g. switching history items)
    useEffect(() => {
        if (initialImages) setImageData(initialImages);
        if (initialPinterest) setPinterestData(initialPinterest);
        if (initialYouTube) setYouTubeScript(initialYouTube);
        if (initialReels) setReelsScript(initialReels);
    }, [initialImages, initialPinterest, initialYouTube, initialReels]);

    const handleCompare = async () => {
        if (!parsedData) return;
        setIsComparing(true);
        setComparisonError(null);
        setIsBillingError(false);
        try {
            const result = await compareArticleWithCompetitors(parsedData.mainArticle, components.competitorAnalysis);
            setComparisonResult(result);
            setActiveTab('analysis');
             // Scroll to the analysis tab button after a short delay to allow rendering
            setTimeout(() => {
                analysisTabRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        } catch (err) {
             console.error(err);
            if (err instanceof BillingRequiredError) {
                setComparisonError(`${err.message} You can find more information about billing and API keys at: `);
                setIsBillingError(true);
            } else {
                setComparisonError(err instanceof Error ? err.message : 'An unexpected error occurred during comparison.');
            }
        } finally {
            setIsComparing(false);
        }
    };

    const handleGenerateImages = async () => {
        if (!parsedData) return;
        setIsGeneratingImages(true);
        setImageError(null);
        setIsBillingError(false);
        try {
            const images = await generateImagePromptsAndMetadata(
                components.targetKeyword,
                components.ingredients,
                components.instructions
            );
            setImageData(images);
            if (savedArticleId) {
                updateHistoryItem(savedArticleId, { images });
            }
        } catch (err) {
             console.error(err);
             if (err instanceof BillingRequiredError) {
                setImageError(`${err.message} You can find more information about billing and API keys at: `);
                setIsBillingError(true);
            } else {
                setImageError(err instanceof Error ? err.message : 'An unexpected error occurred during image prompt generation.');
            }
        } finally {
            setIsGeneratingImages(false);
        }
    };
    
    const handleGeneratePinterest = async () => {
        if (!parsedData) return;
        setIsGeneratingPinterest(true);
        setPinterestError(null);
        setIsBillingError(false);
        try {
            const content = await generatePinterestContent(
                components.targetKeyword,
                components.relatedKeywords,
                parsedData.articleTitle
            );
            setPinterestData(content);
            if (savedArticleId) {
                updateHistoryItem(savedArticleId, { pinterest: content });
            }
        } catch (err) {
             console.error(err);
             if (err instanceof BillingRequiredError) {
                setPinterestError(`${err.message} You can find more information about billing and API keys at: `);
                setIsBillingError(true);
            } else {
                setPinterestError(err instanceof Error ? err.message : 'An unexpected error occurred during Pinterest content generation.');
            }
        } finally {
            setIsGeneratingPinterest(false);
        }
    }
    
    const handleGenerateYouTubeScript = async () => {
        if (!parsedData) return;
        setIsGeneratingYouTube(true);
        setYouTubeError(null);
        setIsBillingError(false);
        try {
            const script = await generateYouTubeScript(
                parsedData.articleTitle,
                parsedData.mainArticle
            );
            setYouTubeScript(script);
            if (savedArticleId) {
                updateHistoryItem(savedArticleId, { youtube: script });
            }
        } catch (err) {
             console.error(err);
             if (err instanceof BillingRequiredError) {
                setYouTubeError(`${err.message} You can find more information about billing and API keys at: `);
                setIsBillingError(true);
            } else {
                setYouTubeError(err instanceof Error ? err.message : 'An unexpected error occurred during YouTube script generation.');
            }
        } finally {
            setIsGeneratingYouTube(false);
        }
    };

    const handleGenerateReelsScript = async () => {
        if (!parsedData) return;
        setIsGeneratingReels(true);
        setReelsError(null);
        setIsBillingError(false);
        try {
            const script = await generateReelsScript(
                parsedData.articleTitle,
                components.ingredients,
                components.instructions
            );
            setReelsScript(script);
            if (savedArticleId) {
                updateHistoryItem(savedArticleId, { reelsScript: script });
            }
        } catch (err) {
             console.error(err);
             if (err instanceof BillingRequiredError) {
                setReelsError(`${err.message} You can find more information about billing and API keys at: `);
                setIsBillingError(true);
            } else {
                setReelsError(err instanceof Error ? err.message : 'An unexpected error occurred during Reels script generation.');
            }
        } finally {
            setIsGeneratingReels(false);
        }
    };
    
     const handleSelectApiKey = async () => {
        if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            setComparisonError(null);
            setImageError(null);
            setPinterestError(null);
            setYouTubeError(null);
            setReelsError(null);
            setIsBillingError(false);
        } else {
            const msg = "API key selection tool not available. Ensure you're in a supported environment.";
            // Set error on all possible error states
            setComparisonError(msg);
            setImageError(msg);
            setPinterestError(msg);
            setYouTubeError(msg);
            setReelsError(msg);
        }
    };

    const showToast = (message: string) => {
        setToastMessage(message);
    };

    const handleCopyArticle = () => {
        if (!parsedData) return;
        navigator.clipboard.writeText(`# ${parsedData.articleTitle}\n\n${parsedData.mainArticle}`).then(() => {
            setIsArticleCopied(true);
            showToast('Article content copied!');
        });
    };
    
    useEffect(() => {
        if (isArticleCopied) {
            const timer = setTimeout(() => setIsArticleCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isArticleCopied]);

    const handleDownloadArticle = () => {
        if (!parsedData) return;
        const blob = new Blob([`# ${parsedData.articleTitle}\n\n${parsedData.mainArticle}`], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeFilename = parsedData.articleTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${safeFilename}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (!parsedData) {
        return (
            <section className="w-full bg-gray-800/60 p-8">
                <ErrorMessage message="Could not parse the generated article. The format might be incorrect." />
                <button onClick={onBack} className="mt-4 px-4 py-2 bg-gray-600 rounded">Back</button>
            </section>
        );
    }
    
    const TabButton: React.FC<{tabName: 'article' | 'analysis' | 'images' | 'pinterest' | 'youtube' | 'reels', children: React.ReactNode, ref?: React.Ref<HTMLButtonElement>}> = React.forwardRef(({ tabName, children }, ref) => (
      <button
        ref={ref}
        onClick={() => setActiveTab(tabName)}
        className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-300 border-b-2 whitespace-nowrap ${
          activeTab === tabName
            ? 'text-sky-400 border-sky-400'
            : 'text-gray-400 border-transparent hover:text-sky-300 hover:border-sky-300'
        }`}
      >
        {children}
      </button>
    ));

    return (
        <section className="w-full bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-2xl p-6 md:p-8 border border-gray-700 animate-fade-in">
            <Toast message={toastMessage} show={!!toastMessage} onClose={() => setToastMessage('')} />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
                    Generated Article & Assets
                </h2>
                <button 
                    onClick={onBack} 
                    className="mt-4 sm:mt-0 flex items-center px-4 py-2 font-semibold text-gray-300 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500 transition-all duration-300"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
                    Back to Editor
                </button>
            </div>
            
             <div className="border-b border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-4 overflow-x-auto custom-scrollbar pb-2" aria-label="Tabs">
                    <TabButton tabName="article">Article & SEO</TabButton>
                    <TabButton tabName="analysis" ref={analysisTabRef}>Analysis</TabButton>
                    <TabButton tabName="images">Images</TabButton>
                    <TabButton tabName="pinterest">Pinterest</TabButton>
                    <TabButton tabName="youtube">YouTube Script</TabButton>
                    <TabButton tabName="reels">Video Reels</TabButton>
                </nav>
            </div>

            {/* Article Tab Content */}
            {activeTab === 'article' && (
                <div className="animate-fade-in space-y-12">
                    {/* Main Article Section */}
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                            <h3 className="text-4xl font-bold text-gray-200">{parsedData.articleTitle}</h3>
                            <div className="flex-shrink-0 flex items-center space-x-2">
                                <button onClick={handleCopyArticle} className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors duration-200">
                                   {isArticleCopied ? <CheckIcon /> : <CopyIcon />} {isArticleCopied ? 'Copied!' : 'Copy Article'}
                                </button>
                                 <button onClick={handleDownloadArticle} className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors duration-200">
                                   <DownloadIcon /> Download (.md)
                                </button>
                            </div>
                        </div>
                         <div className={`p-6 rounded-lg border border-gray-700 max-h-[100vh] overflow-y-auto transition-colors ${isArticleCopied ? 'bg-green-900/50' : 'bg-gray-900/50'}`}>
                            <MarkdownRenderer content={parsedData.mainArticle} />
                        </div>
                    </div>
                    
                     {/* SEO Assets Section */}
                    <div>
                        <h3 className="text-3xl font-bold text-gray-200 mb-6 pb-2 border-b-2 border-slate-700">SEO Metadata</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <CopyableList title="SEO Title Tags" items={parsedData.titleTags} />
                            <CopyableList title="Meta Descriptions" items={parsedData.metaDescriptions} />
                        </div>
                    </div>
                    
                    {/* Recipe Card Section */}
                    <div>
                        <h3 className="text-3xl font-bold text-gray-200 mb-6 pb-2 border-b-2 border-slate-700">Recipe Card Details</h3>
                        <div className="space-y-8">
                            <CopyableBlock title="Recipe Summary" content={parsedData.recipeRecap.replace(/\*\*/g, '')} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <CopyableList title="Ingredients" items={components.ingredients.split('\n')} />
                                <CopyableList title="Instructions" items={components.instructions.split('\n')} />
                            </div>
                            <CopyableList title="Nutritional Information" items={components.nutrition.split('\n').filter(Boolean)} />
                        </div>
                    </div>


                    <div className="text-center mt-10 pt-6 border-t border-gray-700">
                        <button
                            onClick={handleCompare}
                            disabled={isComparing}
                            className="px-8 py-3 font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50"
                        >
                            {isComparing ? 'Analyzing...' : 'Analyze vs. Competitors'}
                        </button>
                        <p className="text-sm mt-2 text-gray-500">Get feedback and suggestions for improvement.</p>
                    </div>
                </div>
            )}
            
            {/* Analysis Tab Content */}
            {activeTab === 'analysis' && (
                <div className="animate-fade-in">
                    {isComparing && <LoadingSpinner message="Comparing against competitors..." />}
                    {comparisonError && (
                        <div>
                            <ErrorMessage message={comparisonError} />
                             {isBillingError && (
                                <div className="text-center mt-4">
                                     <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline mb-4 block">ai.google.dev/gemini-api/docs/billing</a>
                                    <button onClick={handleSelectApiKey} className="px-6 py-2 font-bold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700">Select Billed API Key</button>
                                </div>
                            )}
                        </div>
                    )}
                    {comparisonResult && (
                        <div>
                            <MarkdownRenderer content={comparisonResult} />
                            <div className="text-center mt-8 pt-6 border-t border-gray-700">
                                 <button
                                    onClick={() => onRegenerate(comparisonResult)}
                                    disabled={isRegenerating}
                                    className="px-8 py-4 font-bold text-xl text-white bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg shadow-lg hover:from-sky-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500 transition-all duration-300 disabled:opacity-50"
                                >
                                    {isRegenerating ? 'Regenerating...' : 'Regenerate Article with Improvements'}
                                </button>
                                <p className="text-sm mt-2 text-gray-500">This will create a new version of the article based on the feedback.</p>
                            </div>
                        </div>
                    )}
                    {!isComparing && !comparisonResult && !comparisonError && (
                         <div className="text-center p-8 bg-gray-900/50 rounded-lg border border-gray-700">
                             <h3 className="text-xl font-bold text-gray-300">Run Post-Generation Analysis</h3>
                             <p className="mt-2 text-gray-400">Click the button on the "Article & SEO" tab to see how your generated content stacks up and get actionable feedback for improvements.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Images Tab Content */}
            {activeTab === 'images' && (
                 <div className="animate-fade-in">
                    {isGeneratingImages && <LoadingSpinner message="Generating image prompts and metadata..." />}
                    {imageError && (
                         <div>
                            <ErrorMessage message={imageError} />
                            {isBillingError && (
                                <div className="text-center mt-4">
                                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline mb-4 block">ai.google.dev/gemini-api/docs/billing</a>
                                    <button onClick={handleSelectApiKey} className="px-6 py-2 font-bold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700">Select Billed API Key</button>
                                </div>
                            )}
                        </div>
                    )}
                    {imageData && <ArticleImagesDisplay details={imageData} />}
                     {!isGeneratingImages && !imageData && !imageError && (
                         <div className="text-center p-8 bg-gray-900/50 rounded-lg border border-gray-700">
                             <h3 className="text-xl font-bold text-gray-300">Generate Image Assets</h3>
                             <p className="mt-2 text-gray-400 mb-6">Create all the necessary image prompts and SEO metadata for your article.</p>
                            <button onClick={handleGenerateImages} className="px-6 py-3 font-bold text-white bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-lg hover:from-green-600 hover:to-teal-700">Generate Image Prompts</button>
                        </div>
                    )}
                     {imageData && (
                         <div className="text-center mt-10 pt-6 border-t border-gray-700">
                             <button onClick={() => onNavigate('compressor')} className="px-8 py-3 font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700">Go to Image Compressor</button>
                             <p className="text-sm mt-2 text-gray-500">After downloading your images, use the compressor to optimize them for the web.</p>
                         </div>
                    )}
                </div>
            )}

            {/* Pinterest Tab Content */}
             {activeTab === 'pinterest' && (
                 <div className="animate-fade-in">
                    {isGeneratingPinterest && <LoadingSpinner message="Generating Pinterest assets..." />}
                    {pinterestError && (
                        <div>
                            <ErrorMessage message={pinterestError} />
                             {isBillingError && (
                                <div className="text-center mt-4">
                                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline mb-4 block">ai.google.dev/gemini-api/docs/billing</a>
                                    <button onClick={handleSelectApiKey} className="px-6 py-2 font-bold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700">Select Billed API Key</button>
                                </div>
                            )}
                        </div>
                    )}
                    {pinterestData && <PinterestDisplay content={pinterestData} />}
                     {!isGeneratingPinterest && !pinterestData && !pinterestError && (
                         <div className="text-center p-8 bg-gray-900/50 rounded-lg border border-gray-700">
                             <h3 className="text-xl font-bold text-gray-300">Generate Pinterest Marketing Kit</h3>
                             <p className="mt-2 text-gray-400 mb-6">Create 10 unique, SEO-optimized pin ideas with headlines, descriptions, and image guidance.</p>
                            <button onClick={handleGeneratePinterest} className="px-6 py-3 font-bold text-white bg-gradient-to-r from-pink-500 to-red-600 rounded-lg shadow-lg hover:from-pink-600 hover:to-red-700">Generate Pinterest Content</button>
                        </div>
                    )}
                </div>
            )}
            
            {/* YouTube Tab Content */}
            {activeTab === 'youtube' && (
                <div className="animate-fade-in">
                    {isGeneratingYouTube && <LoadingSpinner message="Generating YouTube script..." />}
                    {youTubeError && (
                        <div>
                            <ErrorMessage message={youTubeError} />
                            {isBillingError && (
                                <div className="text-center mt-4">
                                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline mb-4 block">ai.google.dev/gemini-api/docs/billing</a>
                                    <button onClick={handleSelectApiKey} className="px-6 py-2 font-bold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700">Select Billed API Key</button>
                                </div>
                            )}
                        </div>
                    )}
                    {youTubeScript && (
                        <div>
                            <h3 className="text-3xl font-bold text-gray-200 mb-6 pb-2 border-b-2 border-slate-700">Generated YouTube Script</h3>
                            <div className="p-6 rounded-lg border border-gray-700 bg-gray-900/50 max-h-[100vh] overflow-y-auto">
                                <MarkdownRenderer content={youTubeScript} />
                            </div>
                        </div>
                    )}
                    {!isGeneratingYouTube && !youTubeScript && !youTubeError && (
                        <div className="text-center p-8 bg-gray-900/50 rounded-lg border border-gray-700">
                            <h3 className="text-xl font-bold text-gray-300">Generate YouTube Video Script</h3>
                            <p className="mt-2 text-gray-400 mb-6">Repurpose your article into an engaging video script to reach a wider audience on YouTube.</p>
                            <button onClick={handleGenerateYouTubeScript} className="px-6 py-3 font-bold text-white bg-gradient-to-r from-red-500 to-purple-600 rounded-lg shadow-lg hover:from-red-500 hover:to-purple-700">Generate Script</button>
                        </div>
                    )}
                </div>
            )}

            {/* Video Reels Tab Content */}
            {activeTab === 'reels' && (
                <div className="animate-fade-in">
                    {isGeneratingReels && <LoadingSpinner message="Generating 90s Reels script..." />}
                    {reelsError && (
                        <div>
                            <ErrorMessage message={reelsError} />
                            {isBillingError && (
                                <div className="text-center mt-4">
                                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline mb-4 block">ai.google.dev/gemini-api/docs/billing</a>
                                    <button onClick={handleSelectApiKey} className="px-6 py-2 font-bold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700">Select Billed API Key</button>
                                </div>
                            )}
                        </div>
                    )}
                    {reelsScript && (
                        <div>
                            <h3 className="text-3xl font-bold text-gray-200 mb-6 pb-2 border-b-2 border-slate-700">Generated 90s Reels Script</h3>
                            <div className="p-6 rounded-lg border border-gray-700 bg-gray-900/50 max-h-[100vh] overflow-y-auto">
                                <MarkdownRenderer content={reelsScript} />
                            </div>
                        </div>
                    )}
                    {!isGeneratingReels && !reelsScript && !reelsError && (
                        <div className="text-center p-8 bg-gray-900/50 rounded-lg border border-gray-700">
                            <h3 className="text-xl font-bold text-gray-300">Generate Video Reels Script</h3>
                            <p className="mt-2 text-gray-400 mb-6">Create a viral, fast-paced 90-second vertical video script perfect for Instagram Reels, TikTok, and YouTube Shorts.</p>
                            <button onClick={handleGenerateReelsScript} className="px-6 py-3 font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg shadow-lg hover:from-pink-500 hover:to-purple-700">Generate Reels Script</button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};