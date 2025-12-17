import React, { useState } from 'react';
import { AllPinterestContent, PinterestPinDetails } from '../services/geminiService';

const CopyIconSmall = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIconSmall = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const CopyableMetadataField: React.FC<{ label: string; text: string }> = ({ label, text }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            setIsCopied(true);
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">{label}</span>
                <button
                    onClick={handleCopy}
                    className={`p-1 rounded-md transition-colors duration-200 ${isCopied ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'}`}
                    aria-label={`Copy ${label}`}
                >
                    {isCopied ? <CheckIconSmall /> : <CopyIconSmall />}
                </button>
            </div>
            <p className={`text-sm text-gray-300 mt-1 p-2 rounded-md transition-colors duration-300 ${isCopied ? 'bg-green-900/50' : 'bg-gray-800/40'}`}>{text}</p>
        </div>
    );
};

const PinterestPinCard: React.FC<{ details: PinterestPinDetails; pinNumber: number; }> = ({ details, pinNumber }) => {
    return (
        <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-4 space-y-4 shadow-lg flex flex-col h-full">
            <h4 className="font-bold text-gray-200 text-lg">Pin #{pinNumber}</h4>
            
            <CopyableMetadataField label="Image Guidance" text={details.imageGuidance} />
            <div className="border-t border-gray-700 pt-4 space-y-4">
                <CopyableMetadataField label="Headline" text={details.headline} />
                <CopyableMetadataField label="Description" text={details.description} />
                <CopyableMetadataField label="Alt Text" text={details.altText} />
            </div>
        </div>
    );
};


interface PinterestDisplayProps {
    content: AllPinterestContent;
}

export const PinterestDisplay: React.FC<PinterestDisplayProps> = ({ content }) => {
    const handleCreateNewPost = () => {
        window.location.reload();
    };

    return (
        <section className="w-full bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-2xl p-6 md:p-8 border border-gray-700 mt-8 animate-fade-in">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500">
                    Pinterest Marketing Kit
                </h2>
                <p className="mt-2 text-gray-400">Your complete toolkit for creating 10 high-performing Pinterest pins.</p>
            </div>
            
             <div>
                 <h3 className="text-2xl font-bold text-gray-200 mb-6 pb-2 border-b-2 border-gray-700">10 Unique Pin Ideas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {content.pins.map((pin, index) => (
                        <PinterestPinCard
                            key={index}
                            details={pin}
                            pinNumber={index + 1}
                        />
                    ))}
                </div>
            </div>
            
            <div className="text-center mt-12 pt-8 border-t border-gray-700">
                <button
                    onClick={handleCreateNewPost}
                    className="px-8 py-4 font-bold text-xl text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-lg shadow-lg hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-500 transition-all duration-300"
                >
                    Create New Post
                </button>
                <p className="mt-3 text-sm text-gray-500">This will refresh the application and clear all fields.</p>
            </div>

        </section>
    );
};
