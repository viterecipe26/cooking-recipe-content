
import React from 'react';

// A simplified parser to avoid complex dependencies or dangerous innerHTML
const parseMarkdown = (text: string) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];

  const flushList = () => {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside pl-5 my-4 space-y-2 text-gray-300">
          {currentListItems}
        </ul>
      );
      currentListItems = [];
    }
  };
  
  const renderLine = (line: string): React.ReactNode[] => {
      // Handle bold text and then links
      return line.split(/(\*\*.*?\*\*)/g).map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-bold text-gray-100">{part.slice(2, -2)}</strong>;
          }
          return part;
      });
  };

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={elements.length} className="text-3xl font-bold text-orange-400 mt-8 mb-4 border-b-2 border-gray-700 pb-2">{renderLine(line.substring(3))}</h2>);
    } else if (line.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={elements.length} className="text-2xl font-semibold text-gray-200 mt-6 mb-3">{renderLine(line.substring(4))}</h3>);
    } else if (line.match(/^\s*[-*]\s/)) {
      currentListItems.push(<li key={`${elements.length}-${currentListItems.length}`}>{renderLine(line.replace(/^\s*[-*]\s/, ''))}</li>);
    } else if (line.trim() !== '') {
      flushList();
      elements.push(<p key={elements.length} className="leading-relaxed my-4 text-gray-300">{renderLine(line)}</p>);
    } else {
        // empty line can be a paragraph break
        flushList();
    }
  }
  flushList(); // Make sure to flush any remaining list items
  return elements;
};


export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const renderedContent = parseMarkdown(content);
  return <div className="prose prose-invert max-w-none">{renderedContent}</div>;
};