import React from 'react';

// Formatter for bold text **like this**
export const formatBold = (text) => {
  const parts = [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  let lastIndex = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    parts.push(text.substring(lastIndex, match.index));
    parts.push(
      <strong key={`bold-${match.index}`} className="text-white font-semibold">
        {match[1]}
      </strong>
    );
    lastIndex = boldRegex.lastIndex;
  }

  parts.push(text.substring(lastIndex));
  return parts;
};

// Formatter for inline elements (**bold**, [source_citation])
export const formatInline = (text) => {
  const parts = [];
  const currentText = text;

  // Highlight citation tags [Source: chunk_id] or [Source ID: chunk_id] or [learners_license_desc]
  const citationRegex = /\[(?:Source|Source ID|श्रौत|स्रोत)?:\s*([\w_]+)\]|\[([\w_]+)\]/g;

  let match;
  let lastIndex = 0;

  while ((match = citationRegex.exec(currentText)) !== null) {
    const textBefore = currentText.substring(lastIndex, match.index);
    const citationId = match[1] || match[2];

    parts.push(...formatBold(textBefore));

    parts.push(
      <span
        key={`cite-${match.index}`}
        className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 cursor-help"
        title={`Verified Knowledge Chunk: ${citationId}`}
      >
        🔗 {citationId.replace('_desc', ' Info').replace('_steps', ' Steps')}
      </span>
    );

    lastIndex = citationRegex.lastIndex;
  }

  parts.push(...formatBold(currentText.substring(lastIndex)));
  return parts;
};

// Simple local Markdown parser component for chat responses
export const MarkdownViewer = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, idx) => {
        if (line.startsWith('###')) {
          return (
            <h3 key={idx} className="mt-4 mb-2 text-indigo-400 font-semibold border-b border-white/5 pb-1">
              {line.replace('###', '').trim()}
            </h3>
          );
        }
        if (line.startsWith('-') || line.startsWith('*')) {
          const formatted = formatInline(line.substring(1).trim());
          return (
            <li key={idx} className="ml-4 list-disc text-gray-300 my-1">
              {formatted}
            </li>
          );
        }
        if (/^\d+\./.test(line)) {
          const formatted = formatInline(line.replace(/^\d+\./, '').trim());
          return (
            <li key={idx} className="ml-4 list-decimal text-gray-300 my-1">
              {formatted}
            </li>
          );
        }
        if (line.trim() === '') {
          return <div key={idx} className="h-2"></div>;
        }
        return (
          <p key={idx} className="my-1.5 text-gray-200">
            {formatInline(line)}
          </p>
        );
      })}
    </>
  );
};

export default MarkdownViewer;
