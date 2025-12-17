import React from 'react';

export const WelcomePlaceholder: React.FC = () => {
  return (
    <div className="text-center p-8 bg-slate-800/50 rounded-lg border border-slate-700 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-300">Welcome to Vite Recipe</h2>
      <p className="mt-2 text-slate-400">Please provide the necessary inputs to begin the content analysis and creation process.</p>
    </div>
  );
};