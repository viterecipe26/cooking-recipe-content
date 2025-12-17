import React, { useState } from 'react';
import { AllImageDetails, ImageDetails } from '../services/geminiService';

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

const ImageDisplayCard: React.FC<{ details: ImageDetails; title: string; }> = ({ details, title }) => {
    const [isPromptCopied, setIsPromptCopied] = useState(false);

    const handleCopyPrompt = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(details.prompt).then(() => {
            setIsPromptCopied(true);
        });
    };

    return (
        <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-4 shadow-lg flex flex-col h-full">
            <h3 className="text-xl font-bold text-gray-200 mb-4 pb-2 border-b-2 border-gray-700">{title}</h3>
            <div className="space-y-4 flex-grow flex flex-col">
                <div className="flex-grow">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-orange-400 uppercase tracking-wider">Image Prompt</span>
                        <button
                            onClick={handleCopyPrompt}
                            className={`p-1 rounded-md transition-colors duration-200 ${isPromptCopied ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'}`}
                            aria-label="Copy Image Prompt"
                        >
                            {isPromptCopied ? <CheckIconSmall /> : <CopyIconSmall />}
                        </button>
                    </div>
                    <p className={`text-sm text-gray-300 font-mono p-2 rounded mt-1 overflow-auto max-h-40 transition-colors duration-300 ${isPromptCopied ? 'bg-green-900/50' : 'bg-gray-900/80'}`}>
                        {details.prompt}
                    </p>
                </div>

                <div className="space-y-4 mt-auto">
                    <CopyableMetadataField label="Title" text={details.title} />
                    <CopyableMetadataField label="Alt Text" text={details.altText} />
                    <CopyableMetadataField label="Caption" text={details.caption} />
                    <CopyableMetadataField label="Description" text={details.description} />
                </div>
            </div>
        </div>
    );
};


interface ArticleImagesDisplayProps {
    details: AllImageDetails;
}

export const ArticleImagesDisplay: React.FC<ArticleImagesDisplayProps> = ({ details }) => {
    return (
        <section className="w-full bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-2xl p-6 md:p-8 border border-gray-700 animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500">
                    Image Prompts & Metadata
                </h2>
                <p className="mt-2 text-gray-400">Review, copy, and use these prompts and metadata in your preferred image generator.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <ImageDisplayCard
                    details={details.featuredImage}
                    title="Featured Image"
                />
                <ImageDisplayCard
                    details={details.ingredientsImage}
                    title="Ingredients Image"
                />
            </div>
            
            <div>
                 <h3 className="text-2xl font-bold text-gray-200 mb-6 pb-2 border-b-2 border-gray-700">Step-by-Step Images</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {details.stepImages.map((stepDetail, index) => (
                        <ImageDisplayCard
                            key={index}
                            details={stepDetail}
                            title={`Step ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
