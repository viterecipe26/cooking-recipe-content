
import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

export const AnalysisDisplay: React.FC<{ title: string; content: string }> = ({ title, content }) => {
  return (
    <section className="bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-slate-700 animate-fade-in">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 mb-4 pb-2 border-b-2 border-slate-700">{title}</h2>
        <div className="max-h-[80vh] overflow-y-auto pr-2">
            <MarkdownRenderer content={content} />
        </div>
    </section>
  );
};