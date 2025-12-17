
import React, { useState, useEffect, useRef } from 'react';
import { 
    generateCompetitorAnalysis, 
    generateOutrankingStrategy, 
    generateRecipeSections, 
    RecipeSections,
    delay,
    BillingRequiredError, // Import the new error type
} from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ArticleComponentsForm } from './ArticleComponentsForm';

type Page = 'home' | 'extractor' | 'analyzer' | 'compressor' | 'about' | 'privacy' | 'contact';

const countries = ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo, Democratic Republic of the', 'Congo, Republic of the', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine State', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'];
const languages = ['English', 'Mandarin Chinese', 'Hindi', 'Spanish', 'French', 'Standard Arabic', 'Bengali', 'Russian', 'Portuguese', 'Indonesian'];

interface CompetitorAnalyzerProps {
  initialKeyword: string;
  initialContent: string;
  initialRelatedKeywords: string;
  initialInternalLinks: string;
  onBack: () => void;
  onNavigate: (page: Page) => void;
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

const CopyableList: React.FC<{ title: string; items: string[] }> = ({ title, items }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!items || items.length === 0) return;
    const textToCopy = items.join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
    }).catch(err => {
      console.error("Failed to copy text: ", err);
    });
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={`relative p-6 rounded-lg border border-slate-700 transition-colors ${isCopied ? 'bg-green-900/50' : 'bg-slate-900/50'}`}>
      <h3 className="text-xl font-bold text-sky-400 mb-4">{title}</h3>
      <button
        onClick={handleCopy}
        className={`absolute top-4 right-4 flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
          isCopied
            ? 'bg-green-600/80 text-white'
            : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600/90'
        }`}
        aria-label={`Copy ${title}`}
      >
        {isCopied ? <CheckIcon /> : <CopyIcon />}
        {isCopied ? 'Copied!' : 'Copy'}
      </button>
      <ul className="space-y-2 text-slate-300">
        {items.map((item, index) => (
          <li key={index} className="pl-4 border-l-2 border-slate-600 leading-relaxed">{item}</li>
        ))}
      </ul>
    </div>
  );
};

const CopyableNutritionBlock: React.FC<{ content: string }> = ({ content }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
    }).catch(err => {
      console.error("Failed to copy text: ", err);
    });
  };

  if (!content) {
    return null;
  }

  return (
    <div className={`relative p-6 rounded-lg border border-slate-700 transition-colors ${isCopied ? 'bg-green-900/50' : 'bg-slate-900/50'}`}>
      <h3 className="text-xl font-bold text-sky-400 mb-4">Nutrition</h3>
      <button
        onClick={handleCopy}
        className={`absolute top-4 right-4 flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
          isCopied
            ? 'bg-green-600/80 text-white'
            : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600/90'
        }`}
        aria-label="Copy Nutrition Facts"
      >
        {isCopied ? <CheckIcon /> : <CopyIcon />}
        {isCopied ? 'Copied!' : 'Copy'}
      </button>
      <p className="text-slate-300 leading-relaxed">{content}</p>
    </div>
  );
};

interface CustomSelectProps {
  id: string;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  searchable?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ id, label, options, value, onChange, searchable = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const selectRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    useEffect(() => {
        if (isOpen && searchable) {
            inputRef.current?.focus();
        }
    }, [isOpen, searchable]);

    const filteredOptions = searchTerm
        ? options.filter(option => option.toLowerCase().includes(searchTerm.toLowerCase()))
        : options;

    const handleSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
            <div className="relative" ref={selectRef}>
                <button
                    type="button"
                    id={id}
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex justify-between items-center px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-300 placeholder-slate-400 text-left"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                >
                    <span className="truncate">{value}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {isOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
                        {searchable && (
                            <div className="p-2 border-b border-slate-700">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
                                />
                            </div>
                        )}
                        <ul className="overflow-y-auto flex-1">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map(option => (
                                    <li
                                        key={option}
                                        onClick={() => handleSelect(option)}
                                        className="px-4 py-2 text-slate-300 hover:bg-slate-700 cursor-pointer"
                                        role="option"
                                        aria-selected={value === option}
                                    >
                                        {option}
                                    </li>
                                ))
                            ) : (
                                <li className="px-4 py-2 text-slate-500">No options found.</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export const CompetitorAnalyzer: React.FC<CompetitorAnalyzerProps> = ({
  initialKeyword,
  initialContent,
  initialRelatedKeywords,
  initialInternalLinks,
  onBack,
  onNavigate,
}) => {
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [strategyResult, setStrategyResult] = useState<string | null>(null);
  const [recipeSectionsResult, setRecipeSectionsResult] = useState<RecipeSections | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isBillingError, setIsBillingError] = useState(false);
  const [region, setRegion] = useState('United States');
  const [language, setLanguage] = useState('English');
  const [currentStep, setCurrentStep] = useState<'initial' | 'results' | 'components'>('initial');

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setIsBillingError(false);

    try {
      setLoadingMessage('Analyzing competitor content...');
      const analysis = await generateCompetitorAnalysis(initialKeyword, region, language, initialContent);
      setAnalysisResult(analysis);
      await delay(500);

      setLoadingMessage('Generating outranking strategy...');
      const strategy = await generateOutrankingStrategy(analysis);
      setStrategyResult(strategy);
      await delay(500);

      setLoadingMessage('Extracting recipe sections...');
      const recipes = await generateRecipeSections(analysis, region, language);
      setRecipeSectionsResult(recipes);

      setCurrentStep('results');
    } catch (err) {
      console.error(err);
      if (err instanceof BillingRequiredError) {
        setError(`${err.message} You can find more information about billing and API keys at: `);
        setIsBillingError(true);
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        setIsBillingError(false);
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
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

  // Determine dynamic header content based on current step
  let headerTitle = "Competitor Analysis";
  let headerSubtitle = "Uncover insights to create superior content.";

  if (currentStep === 'results') {
    headerTitle = "Strategic Analysis";
    headerSubtitle = "Review insights and outranking strategy.";
  } else if (currentStep === 'components') {
    headerTitle = "Article Configuration";
    headerSubtitle = "Refine components to craft the perfect article.";
  }

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner message={loadingMessage} />;
    }
    if (error) {
      return (
        <div className="text-center">
            <ErrorMessage message={error} />
            {isBillingError && (
                <div className="text-center mt-4">
                    <a 
                        href="https://ai.google.dev/gemini-api/docs/billing" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-400 hover:underline mb-4 block"
                    >
                        ai.google.dev/gemini-api/docs/billing
                    </a>
                    <button
                        onClick={handleSelectApiKey}
                        className="px-6 py-3 font-bold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                    >
                        Select Billed API Key
                    </button>
                    <p className="mt-2 text-sm text-gray-500">Ensure your selected key is linked to a project with active billing.</p>
                </div>
            )}
        </div>
      );
    }

    if (currentStep === 'components' && analysisResult && recipeSectionsResult) {
      return (
        <ArticleComponentsForm 
          keyword={initialKeyword} 
          analysisResult={analysisResult} 
          recipeSections={recipeSectionsResult}
          userRelatedKeywords={initialRelatedKeywords}
          userInternalLinks={initialInternalLinks}
          onNavigate={onNavigate}
          targetRegion={region}
          targetLanguage={language}
        />
      );
    }
    
    if (currentStep === 'results' && analysisResult && strategyResult && recipeSectionsResult) {
      return (
        <div className="space-y-8 animate-fade-in w-full">
          <section className="bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-slate-700">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 mb-4">Competitor Analysis</h2>
            <div className="max-h-[80vh] overflow-y-auto pr-2">
              <MarkdownRenderer content={analysisResult} />
            </div>
          </section>
          <section className="bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-slate-700">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 mb-4">Outranking Strategy</h2>
            <div className="max-h-[80vh] overflow-y-auto pr-2">
              <MarkdownRenderer content={strategyResult} />
            </div>
          </section>
          <section className="bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-slate-700">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 mb-6">Extracted Recipe Sections</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <CopyableList title="Ingredients" items={recipeSectionsResult.ingredients} />
                <CopyableList title="Instructions" items={recipeSectionsResult.instructions} />
                <CopyableNutritionBlock content={recipeSectionsResult.nutritionFacts} />
            </div>
          </section>

          <div className="text-center pt-4">
             <button
                onClick={() => setCurrentStep('components')}
                className="px-10 py-4 font-bold text-xl text-white bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg shadow-lg hover:from-sky-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500 transition-all duration-300"
            >
                Proceed to Article Generation
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-slate-700 text-center animate-fade-in w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600">Analyze Competitors</h2>
        <p className="mt-2 mb-8 text-slate-400">Specify the target audience to tailor the analysis.</p>
        <div className="max-w-md mx-auto space-y-6">
            <CustomSelect
              id="region"
              label="Target Region/Country"
              options={countries}
              value={region}
              onChange={setRegion}
              searchable
            />
            <CustomSelect
              id="language"
              label="Target Language"
              options={languages}
              value={language}
              onChange={setLanguage}
            />
        </div>
        <div className="mt-10">
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="px-8 py-4 font-bold text-lg text-white bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg shadow-lg hover:from-sky-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Analyzing...' : 'Start Analysis'}
            </button>
        </div>
      </div>
    );
  };

  return (
    <main className="max-w-7xl mx-auto w-full pt-24 pb-12 flex flex-col items-center">
        <header className="text-center w-full mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600">
                {headerTitle}
            </h1>
            <p className="mt-2 text-lg text-slate-400">
                {headerSubtitle}
            </p>
        </header>
        {renderContent()}
    </main>
  );
};