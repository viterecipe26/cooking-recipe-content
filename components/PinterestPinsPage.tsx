
import React, { useState, useEffect, useRef } from 'react';
import { 
    generatePinterestKeywords,
    generatePinterestPins,
    PinterestPinDetails,
    BillingRequiredError
} from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

// --- ICONS ---
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const GenerateWithAIIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.5,0 C12.5,0 13.0625,2.1875 14.375,3.5 C15.6875,4.8125 17.875,5.375 17.875,5.375 C17.875,5.375 15.6875,5.9375 14.375,7.25 C13.0625,8.5625 12.5,10.75 12.5,10.75 C12.5,10.75 11.9375,8.5625 10.625,7.25 C9.3125,5.9375 7.125,5.375 7.125,5.375 C7.125,5.375 9.3125,4.8125 10.625,3.5 C11.9375,2.1875 12.5,0 12.5,0 Z M3.5,2.75 C3.5,2.75 3.8625,4.0125 4.675,4.825 C5.4875,5.6375 6.75,6 6.75,6 C6.75,6 5.4875,6.3625 4.675,7.175 C3.8625,7.9875 3.5,9.25 3.5,9.25 C3.5,9.25 3.1375,7.9875 2.325,7.175 C1.5125,6.3625 0.25,6 0.25,6 C0.25,6 1.5125,5.6375 2.325,4.825 C3.1375,4.0125 3.5,2.75 3.5,2.75 Z M20.5,10 C20.5,10 20.9,11.4 21.8,12.3 C22.7,13.2 24,13.625 24,13.625 C24,13.625 22.7,14.05 21.8,14.95 C20.9,15.85 20.5,17.25 20.5,17.25 C20.5,17.25 20.1,15.85 19.2,14.95 C18.3,14.05 17,13.625 17,13.625 C17,13.625 18.3,13.2 19.2,12.3 C20.1,11.4 20.5,10 20.5,10 Z" />
    </svg>
);
const ClearIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CopyIconSmall = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CheckIconSmall = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;

// --- UTILITY FUNCTIONS ---
const blobToBase64 = (blob: Blob): Promise<{base64: string, mimeType: string}> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const base64String = dataUrl.split(',')[1];
            resolve({ base64: base64String, mimeType: blob.type });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// --- SUB-COMPONENTS ---
const KeywordStyleOptions = [
    { value: 'General & Related', label: 'General & Related', description: 'A mix of broad and specific terms.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.293l.5-5.025A1 1 0 019.196 3h5.608a1 1 0 01.989.268l.5 5.025M12 21a9 9 0 100-18 9 9 0 000 18z" /></svg> },
    { value: 'Long-tail Questions', label: 'Long-tail Questions', description: 'Phrase as user search queries.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { value: 'Trending & Viral', label: 'Trending & Viral', description: 'Focus on current popular keywords.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1014.12 11.88l-4.242 4.242z" /></svg> },
    { value: 'Niche-Specific', label: 'Niche-Specific', description: 'Highly targeted for sub-audiences.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" /></svg> },
];

const CustomSelect: React.FC<{ value: string; onChange: (value: string) => void; }> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);
    const selectedOption = KeywordStyleOptions.find(opt => opt.value === value) || KeywordStyleOptions[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={selectRef}>
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between text-left px-4 py-3 bg-slate-700/80 border border-slate-600/80 rounded-lg focus:ring-1 focus:ring-sky-500">
                <span className="flex items-center">
                    <span className="mr-3 text-sky-400">{selectedOption.icon}</span>
                    <span className="font-semibold text-slate-200">{selectedOption.label}</span>
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-[#1E293B] border border-slate-700 rounded-lg shadow-lg">
                    <ul className="py-1">
                        {KeywordStyleOptions.map(option => (
                            <li key={option.value} onClick={() => { onChange(option.value); setIsOpen(false); }} className={`px-4 py-3 cursor-pointer hover:bg-slate-700/50 ${value === option.value ? 'bg-slate-700/30' : ''}`}>
                                <div className="flex items-center">
                                    <span className={value === option.value ? 'text-sky-400' : 'text-slate-400'}>{option.icon}</span>
                                    <div className="ml-3">
                                        <p className={`font-semibold ${value === option.value ? 'text-white' : 'text-slate-300'}`}>{option.label}</p>
                                        <p className="text-sm text-slate-500">{option.description}</p>
                                    </div>
                                    {value === option.value && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-sky-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const CopyableField: React.FC<{ label: string; text: string }> = ({ label, text }) => {
    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setIsCopied(true);
        });
    };
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">{label}</span>
                <button onClick={handleCopy} className={`p-1 rounded-md transition-colors ${isCopied ? 'text-green-400' : 'text-slate-500 hover:text-slate-300'}`}>
                    {isCopied ? <CheckIconSmall /> : <CopyIconSmall />}
                </button>
            </div>
            <p className={`text-sm text-slate-300 p-2 rounded-md transition-colors ${isCopied ? 'bg-green-900/50' : 'bg-slate-800/60'}`}>{text}</p>
        </div>
    );
};

const PinCard: React.FC<{ pin: PinterestPinDetails; index: number; }> = ({ pin, index }) => {
    return (
        <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-4 space-y-4 animate-fade-in flex flex-col">
            <h4 className="font-bold text-slate-200 text-lg border-b border-slate-700 pb-2">Pin Idea #{index + 1}</h4>
            
            <CopyableField label="Image Guidance" text={pin.imageGuidance} />
            <CopyableField label="Headline" text={pin.headline} />
            <CopyableField label="Description" text={pin.description} />
            <CopyableField label="Alt Text" text={pin.altText} />
        </div>
    );
};

// --- MAIN COMPONENT ---
export const PinterestPinsPage: React.FC = () => {
    const [mainKeyword, setMainKeyword] = useState('');
    const [keywordStyle, setKeywordStyle] = useState(KeywordStyleOptions[0].value);
    const [relatedKeywords, setRelatedKeywords] = useState('');
    const [inspirationImage, setInspirationImage] = useState<{ file: File; base64: string; mimeType: string, previewUrl: string } | null>(null);
    
    const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
    const [isLoadingPins, setIsLoadingPins] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isBillingError, setIsBillingError] = useState(false);
    
    const [generatedPins, setGeneratedPins] = useState<PinterestPinDetails[] | null>(null);

    const handleGenerateKeywords = async () => {
        if (!mainKeyword.trim()) {
            setError("Please enter a main keyword first.");
            return;
        }
        setIsLoadingKeywords(true);
        setError(null);
        setIsBillingError(false);
        try {
            const keywords = await generatePinterestKeywords(mainKeyword, keywordStyle);
            setRelatedKeywords(keywords.join('\n'));
        } catch (err) {
            console.error(err);
            if (err instanceof BillingRequiredError) {
                setError(`${err.message} You can find more information about billing and API keys at: `);
                setIsBillingError(true);
            } else {
                setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
            }
        } finally {
            setIsLoadingKeywords(false);
        }
    };

    const handleCreateContent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mainKeyword.trim() || !relatedKeywords.trim()) {
            setError("Please provide a main keyword and related keywords before creating content.");
            return;
        }
        setIsLoadingPins(true);
        setError(null);
        setIsBillingError(false);
        setGeneratedPins(null);
        try {
            const imagePayload = inspirationImage ? { base64: inspirationImage.base64, mimeType: inspirationImage.mimeType } : undefined;
            const result = await generatePinterestPins(mainKeyword, relatedKeywords, imagePayload);
            setGeneratedPins(result.pins);
        } catch (err) {
            console.error(err);
            if (err instanceof BillingRequiredError) {
                setError(`${err.message} You can find more information about billing and API keys at: `);
                setIsBillingError(true);
            } else {
                setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
            }
        } finally {
            setIsLoadingPins(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const { base64, mimeType } = await blobToBase64(file);
                const previewUrl = URL.createObjectURL(file);
                setInspirationImage({ file, base64, mimeType, previewUrl });
            } catch (err) {
                setError("Failed to process the image file.");
            }
        }
    };

    const handleClear = () => {
        setMainKeyword('');
        setRelatedKeywords('');
        setInspirationImage(null);
        setGeneratedPins(null);
        setError(null);
        setIsBillingError(false);
    };
    
     const handleSelectApiKey = async () => {
        if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            setError(null);
            setIsBillingError(false);
        } else {
            setError("API key selection tool not available. Ensure you're in a supported environment.");
        }
    };

    return (
        <main className="w-full flex flex-col md:flex-row gap-8 pt-24 pb-12">
            {/* Left Panel: Inputs */}
            <div className="w-full md:w-1/2 flex-shrink-0">
                <div className="bg-[#192134] rounded-2xl shadow-2xl p-8 border border-slate-700 sticky top-24">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-fuchsia-500 mb-8">Pinterest Pin Generator</h1>
                    <form onSubmit={handleCreateContent} className="space-y-6">
                        {/* Main Keyword */}
                        <div>
                            <label htmlFor="main-keyword" className="block text-base font-bold text-slate-200 mb-1">Main Keyword</label>
                            <p className="text-sm text-slate-500 mb-2">The central theme for your Pinterest posts.</p>
                            <input id="main-keyword" type="text" value={mainKeyword} onChange={(e) => setMainKeyword(e.target.value)} placeholder="e.g., sustainable living" className="w-full px-4 py-3 bg-slate-700/80 border border-slate-600/80 rounded-lg focus:ring-2 focus:ring-sky-500 placeholder-slate-400" />
                        </div>

                        {/* Related Keywords */}
                        <div>
                            <label htmlFor="related-keywords" className="block text-base font-bold text-slate-200 mb-1">10 Related Keywords</label>
                             <p className="text-sm text-slate-500 mb-2">Provide 10 keywords for titles, or generate them using AI below.</p>
                            <div className="bg-[#101727] p-4 rounded-lg space-y-4">
                                <CustomSelect value={keywordStyle} onChange={setKeywordStyle} />
                                <button type="button" onClick={handleGenerateKeywords} disabled={isLoadingKeywords} className="w-full flex items-center justify-center px-4 py-3 font-bold text-slate-900 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-lg shadow-md hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isLoadingKeywords ? 'Generating...' : <><GenerateWithAIIcon /><span>Generate with AI</span></>}
                                </button>
                            </div>
                            <textarea id="related-keywords" value={relatedKeywords} onChange={(e) => setRelatedKeywords(e.target.value)} rows={5} placeholder="e.g., zero waste tips, eco-friendly home, DIY cleaning..." className="mt-3 w-full p-3 bg-slate-700/80 border border-slate-600/80 rounded-lg focus:ring-2 focus:ring-sky-500 placeholder-slate-400" />
                        </div>

                        {/* Inspiration Image */}
                        <div>
                            <label htmlFor="inspiration-image" className="block text-base font-bold text-slate-200 mb-1">Inspiration Image (Optional)</label>
                            <p className="text-sm text-slate-500 mb-2">Upload an image to guide the AI's visual proposals.</p>
                            <div className="relative mt-2 flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-700/50 hover:bg-slate-700/80">
                                    {inspirationImage ? (
                                        <img src={inspirationImage.previewUrl} alt="Inspiration preview" className="h-full w-full object-cover rounded-lg" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400">
                                            <UploadIcon />
                                            <p className="text-sm mt-2">Click to upload</p>
                                        </div>
                                    )}
                                    <input id="inspiration-image" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                                </label>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 space-y-3">
                            <button type="submit" disabled={isLoadingPins} className="w-full px-6 py-3 font-bold text-lg text-white bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg shadow-lg hover:from-sky-600 hover:to-indigo-700 disabled:opacity-50">
                                {isLoadingPins ? 'Creating Content...' : 'Create Content'}
                            </button>
                             <button type="button" onClick={handleClear} className="w-full flex items-center justify-center px-6 py-2 font-semibold text-white bg-slate-600 rounded-lg shadow-md hover:bg-slate-700">
                                <ClearIcon /> Clear All Fields
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Panel: Results */}
            <div className="w-full md:w-1/2">
                <div className="space-y-6">
                    {error && (
                         <div className="text-center bg-slate-800/60 p-4 rounded-lg">
                            <ErrorMessage message={error} />
                            {isBillingError && (
                                <div className="text-center mt-4">
                                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline mb-4 block">ai.google.dev/gemini-api/docs/billing</a>
                                    <button onClick={handleSelectApiKey} className="px-6 py-2 font-bold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700">Select Billed API Key</button>
                                </div>
                            )}
                        </div>
                    )}
                    {isLoadingPins && <LoadingSpinner message="Generating your Pinterest marketing kit..." />}
                    
                    {generatedPins ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {generatedPins.map((pin, index) => (
                                <PinCard 
                                    key={index} 
                                    pin={pin} 
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        !isLoadingPins && (
                            <div className="text-center p-8 bg-slate-800/50 rounded-lg border border-slate-700">
                                <h2 className="text-xl font-bold text-slate-300">Your Pins Await</h2>
                                <p className="mt-2 text-slate-400">Fill in the details on the left and click "Create Content" to generate 10 unique Pinterest pin ideas.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </main>
    );
};