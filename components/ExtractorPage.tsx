
import React, { useState, useCallback, useEffect } from 'react';
import { URLInputForm } from './URLInputForm';
import { ErrorMessage } from './ErrorMessage';

interface AppState {
  keyword: string;
  competitorContent: string;
  relatedKeywords: string;
  internalLinks: string;
}

interface AnalysisData {
    keyword: string;
    content: string;
    relatedKeywords: string;
    internalLinks: string;
}

interface ExtractorPageProps {
    onAnalysisStart: (data: AnalysisData) => void;
    initialContent?: string;
    initialInternalLinks?: string;
    initialKeyword?: string;
}

export const ExtractorPage: React.FC<ExtractorPageProps> = ({ onAnalysisStart, initialContent, initialInternalLinks, initialKeyword }) => {
  const [keyword, setKeyword] = useState<string>('');
  const [competitorContent, setCompetitorContent] = useState<string>('');
  const [relatedKeywords, setRelatedKeywords] = useState<string>('');
  const [internalLinks, setInternalLinks] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Pre-fill content if provided (e.g. from Web Scraper or Sitemap Finder)
  useEffect(() => {
    if (initialContent) {
        setCompetitorContent(initialContent);
    }
    if (initialInternalLinks) {
        setInternalLinks(initialInternalLinks);
    }
    if (initialKeyword) {
        setKeyword(initialKeyword);
    }
  }, [initialContent, initialInternalLinks, initialKeyword]);

  const handleSaveSession = useCallback(() => {
    const stateToSave: AppState = {
      keyword,
      competitorContent,
      relatedKeywords,
      internalLinks,
    };
    try {
        const blob = new Blob([JSON.stringify(stateToSave, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'content-toolkit-session.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Could not save session to file", e);
        setError("Failed to save session to a file.");
    }
  }, [keyword, competitorContent, relatedKeywords, internalLinks]);


  const handleClearState = useCallback(() => {
    setKeyword('');
    setCompetitorContent('');
    setRelatedKeywords('');
    setInternalLinks('');
    setError(null);
  }, []);


  const handleNextStep = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!competitorContent.trim()) {
      setError('Please provide competitor article content before proceeding.');
      return;
    }
    setError(null);
    onAnalysisStart({
        keyword: keyword,
        content: competitorContent,
        relatedKeywords: relatedKeywords,
        internalLinks: internalLinks,
    });
  }, [competitorContent, keyword, relatedKeywords, internalLinks, onAnalysisStart]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      if (event.target) event.target.value = '';
      return;
    }
    
    setError(null);
    const separator = '\n\n---\n\n';
    
    const filesArray: File[] = Array.from(files);
    const jsonFiles: File[] = filesArray.filter((file: File) => file.type === 'application/json' || file.name.endsWith('.json'));
    const txtFiles: File[] = filesArray.filter((file: File) => file.type === 'text/plain');
    
    filesArray.forEach((file: File) => {
      if (!jsonFiles.includes(file) && !txtFiles.includes(file)) {
        setError(prevError => {
          const newError = `File "${file.name}" has an unsupported format and was skipped.`;
          return prevError ? `${prevError}\n${newError}` : newError;
        });
      }
    });

    const processSessionFile = () => {
      return new Promise<void>((resolve) => {
        if (jsonFiles.length === 0) {
          resolve();
          return;
        }

        const sessionFile = jsonFiles[0];
        if (jsonFiles.length > 1) {
          setError(prev => {
            const newError = 'Multiple session files (.json) detected. Only the first one will be loaded.';
            return prev ? `${prev}\n${newError}` : newError;
          });
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const savedState: AppState = JSON.parse(text);
            if ('keyword' in savedState && 'competitorContent' in savedState && 'relatedKeywords' in savedState && 'internalLinks' in savedState) {
              setKeyword(savedState.keyword || '');
              setCompetitorContent(savedState.competitorContent || '');
              setRelatedKeywords(savedState.relatedKeywords || '');
              setInternalLinks(savedState.internalLinks || '');
            } else {
              throw new Error("Invalid session file structure.");
            }
          } catch (jsonError) {
            setError(prev => {
              const newError = `File "${sessionFile.name}" is not a valid session file.`;
              return prev ? `${prev}\n${newError}` : newError;
            });
          } finally {
            resolve();
          }
        };
        reader.onerror = () => {
          setError(prev => {
            const newError = `Failed to read session file "${sessionFile.name}".`;
            return prev ? `${prev}\n${newError}` : newError;
          });
          resolve();
        };
        reader.readAsText(sessionFile);
      });
    };
    
    const processTxtFiles = () => {
        if (txtFiles.length === 0) return;
        const readPromises = txtFiles.map((file: File) => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.onerror = () => {
                    setError(prev => {
                        const newError = `Failed to read file "${file.name}".`;
                        return prev ? `${prev}\n${newError}` : newError;
                    });
                    resolve(''); 
                };
                reader.readAsText(file);
            });
        });

        Promise.all(readPromises).then(contents => {
            const newContent = contents.filter(Boolean).join(separator);
            if (newContent) {
                setCompetitorContent(prev => prev ? `${prev}${separator}${newContent}` : newContent);
            }
        });
    };
    
    processSessionFile().then(() => {
        processTxtFiles();
    });

    if (event.target) {
      event.target.value = '';
    }
  };


  return (
    <main className="max-w-4xl mx-auto flex flex-col items-center space-y-8 flex-grow w-full pt-24 pb-12">
        <header className="text-center w-full">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600">
            Content Extractor & Consolidator
        </h1>
        <p className="mt-2 text-lg text-slate-400">
            Step 1: Input competitor content to begin the analysis.
        </p>
        </header>

        <div className="w-full bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-slate-700">
            {error && <div className="mb-4"><ErrorMessage message={error} /></div>}
            <URLInputForm
                keyword={keyword}
                setKeyword={setKeyword}
                relatedKeywords={relatedKeywords}
                setRelatedKeywords={setRelatedKeywords}
                internalLinks={internalLinks}
                setInternalLinks={setInternalLinks}
                content={competitorContent}
                setContent={setCompetitorContent}
                handleSubmit={handleNextStep}
                isLoading={false}
                handleFileSelect={handleFileSelect}
                onSaveSession={handleSaveSession}
                onClearState={handleClearState}
            />
        </div>
    </main>
  );
};