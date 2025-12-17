
import React, { useState } from 'react';

export const AboutPage: React.FC = () => {
  return (
    <main className="max-w-4xl mx-auto flex-grow w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-slate-700">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 mb-6">
          About Vite Recipe
        </h1>
        <div className="prose prose-invert max-w-none text-slate-300 space-y-4">
          <p>
            Vite Recipe is a powerful suite of AI-driven tools designed for SEO professionals, content creators, and digital marketers in the culinary space. Our mission is to streamline your recipe content workflow, providing you with the insights and assets needed to dominate search engine rankings and create high-quality, engaging food content.
          </p>
          <p>
            Powered by Google's advanced Gemini models, our toolkit automates the tedious parts of content strategy, from competitor analysis to recipe article generation. We believe in leveraging cutting-edge technology to empower creativity and drive measurable results for your food blog.
          </p>
          <h2 className="text-2xl font-bold text-sky-400 mt-8">Our Features</h2>
          <ul className="list-disc pl-5">
            <li><strong>Content Extractor & Consolidator:</strong> Easily gather and combine text from multiple competitor recipe articles or files to create a comprehensive base for analysis.</li>
            <li><strong>AI-Powered Competitor Analysis:</strong> Uncover common themes, identify content gaps, and understand user intent with a deep analysis of your competitors' recipes.</li>
            <li><strong>Strategic Recipe Content Generation:</strong> Generate a complete, SEO-optimized recipe article draft, including titles, meta descriptions, and structured data (Schema.org), based on a data-driven outranking strategy.</li>
            <li><strong>Visual Asset Creation:</strong> Automatically generate detailed prompts for appetizing recipe images and a full marketing kit for Pinterest to promote your new content.</li>
            <li><strong>Image Compressor:</strong> Optimize your high-res food photos for web speed and performance with our simple and effective bulk compression tool.</li>
          </ul>
          <p>
            Whether you're a solo food blogger or part of a culinary marketing team, Vite Recipe is built to enhance your productivity and elevate your content strategy.
          </p>
        </div>
      </div>
    </main>
  );
};