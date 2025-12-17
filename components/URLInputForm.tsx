
import React, { useRef } from 'react';

interface URLInputFormProps {
  keyword: string;
  setKeyword: (keyword: string) => void;
  relatedKeywords: string;
  setRelatedKeywords: (keywords: string) => void;
  internalLinks: string;
  setInternalLinks: (links: string) => void;
  content: string;
  setContent: (content: string) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveSession: () => void;
  onClearState: () => void;
}

const HashtagIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
);

const DocumentTextIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const ArrowRightIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
);

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const ClearIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const LinkIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);

export const URLInputForm: React.FC<URLInputFormProps> = ({
  keyword,
  setKeyword,
  relatedKeywords,
  setRelatedKeywords,
  internalLinks,
  setInternalLinks,
  content,
  setContent,
  handleSubmit,
  isLoading,
  handleFileSelect,
  onSaveSession,
  onClearState
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* Main Keyword */}
      <div className="space-y-2">
        <label htmlFor="keyword" className="block text-sm font-semibold text-slate-300">
            Main Target Keyword
        </label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HashtagIcon />
            </div>
            <input
            id="keyword"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g., homemade lasagna"
            className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 text-slate-200 placeholder-slate-500"
            required
            />
        </div>
      </div>

      {/* Related Keywords */}
      <div className="space-y-2">
        <label htmlFor="relatedKeywords" className="block text-sm font-semibold text-slate-300">
        Related Keywords (Optional)
        </label>
        <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
                <HashtagIcon />
            </div>
            <textarea
            id="relatedKeywords"
            value={relatedKeywords}
            onChange={(e) => setRelatedKeywords(e.target.value)}
            placeholder="Enter related keywords (one per line or comma separated)..."
            rows={4}
            className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 text-slate-200 placeholder-slate-500 custom-scrollbar"
            />
        </div>
      </div>
      
       {/* Internal Links */}
       <div className="space-y-2">
          <label htmlFor="internalLinks" className="block text-sm font-semibold text-slate-300">
            Internal Links (Optional)
          </label>
           <div className="relative">
             <div className="absolute top-3 left-3 pointer-events-none">
                <LinkIcon />
             </div>
            <textarea
              id="internalLinks"
              value={internalLinks}
              onChange={(e) => setInternalLinks(e.target.value)}
              placeholder="Enter internal links (one per line or comma separated)..."
              rows={4}
              className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 text-slate-200 placeholder-slate-500 custom-scrollbar"
            />
          </div>
        </div>

      {/* Content Area */}
      <div className="space-y-2">
        <label htmlFor="content" className="block text-sm font-semibold text-slate-300">
          Competitor Content
        </label>
        <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
                <DocumentTextIcon />
            </div>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the text content of competitor articles here..."
              className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 text-slate-200 placeholder-slate-500 min-h-[200px] custom-scrollbar"
              required
            />
        </div>
      </div>
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-700/50">
        <div className="flex gap-3 w-full sm:w-auto">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
                accept=".txt,.json"
            />
            <button
                type="button"
                onClick={handleUploadClick}
                className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
                <UploadIcon /> Upload Files
            </button>
            <button
                type="button"
                onClick={onSaveSession}
                className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
                <DownloadIcon /> Save Session
            </button>
             <button
                type="button"
                onClick={onClearState}
                className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-slate-300 bg-slate-700 rounded-lg hover:bg-red-900/50 hover:text-red-400 hover:border-red-700/50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Clear all inputs"
            >
                <ClearIcon /> Clear
            </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto sm:ml-auto flex items-center justify-center px-8 py-3 text-base font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg shadow-lg hover:from-sky-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
            </>
          ) : (
            <>
              Analyze Content <ArrowRightIcon />
            </>
          )}
        </button>
      </div>
    </form>
  );
};