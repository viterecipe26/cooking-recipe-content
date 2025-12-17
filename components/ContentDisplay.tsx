
import React, { useState } from 'react';

interface ContentDisplayProps {
  url: string;
  content: string;
}

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

export const ContentDisplay: React.FC<ContentDisplayProps> = ({ url, content }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy text: ", err);
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-sky-400 break-words font-serif tracking-wide">
          {url}
        </h2>
      </div>

      <div className="relative group">
        <div className={`prose prose-invert max-w-none p-6 rounded-xl border transition-colors duration-300 ${isCopied ? 'bg-green-900/20 border-green-500/30' : 'bg-slate-900/50 border-slate-700'}`}>
          <button
            onClick={handleCopy}
            className={`absolute top-4 right-4 flex items-center justify-center px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-300 shadow-lg ${
              isCopied
                ? 'bg-green-500 text-white transform scale-105'
                : 'bg-slate-700 text-slate-300 hover:bg-sky-500 hover:text-white opacity-0 group-hover:opacity-100 focus:opacity-100'
            }`}
            aria-label="Copy content to clipboard"
          >
            {isCopied ? <CheckIcon /> : <CopyIcon />}
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
          <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300 leading-relaxed">{content}</pre>
        </div>
      </div>
    </div>
  );
};