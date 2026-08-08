import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';

// Import Prism syntax components for common languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup'; // HTML/XML
import 'prismjs/components/prism-yaml';

import { Copy, Check, ExternalLink, Terminal, Quote } from 'lucide-react';

// Formatter for bold text **like this**
export const formatBold = (text) => {
  if (typeof text !== 'string') return [text];
  const parts = [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  let lastIndex = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    parts.push(text.substring(lastIndex, match.index));
    parts.push(
      <strong key={`bold-${match.index}`} className="text-slate-900 font-bold">
        {match[1]}
      </strong>
    );
    lastIndex = boldRegex.lastIndex;
  }

  parts.push(text.substring(lastIndex));
  return parts;
};

// Formatter for inline elements
export const formatInline = (text) => {
  if (typeof text !== 'string') return [text];
  const parts = [];
  const currentText = text;

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
        className="inline-flex items-center px-2 py-0.5 mx-1 rounded text-xs font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-help"
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

// Preprocesses raw text to transform citation tags into markdown link syntax targeting #cite:citationId
export const preprocessMarkdown = (text) => {
  if (!text) return '';
  const citationRegex = /\[(?:Source|Source ID|श्रौत|स्रोत)?:\s*([\w_]+)\]|\[([\w_]+)\](?!\()/g;
  
  return text.replace(citationRegex, (match, p1, p2) => {
    const citationId = p1 || p2;
    const label = citationId.replace('_desc', ' Info').replace('_steps', ' Steps');
    return `[🔗 ${label}](#cite:${citationId} "Verified Knowledge Chunk: ${citationId}")`;
  });
};

// Custom Code Block component
const CodeBlock = ({ children, className }) => {
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1].toLowerCase() : '';
  const codeString = String(children).replace(/\n$/, '');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const highlightedHtml = useMemo(() => {
    if (!lang) return null;
    const aliasMap = {
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
      sh: 'bash',
      shell: 'bash',
      html: 'markup',
      xml: 'markup',
      yml: 'yaml'
    };
    const targetLang = aliasMap[lang] || lang;
    if (Prism.languages[targetLang]) {
      try {
        return Prism.highlight(codeString, Prism.languages[targetLang], targetLang);
      } catch (_e) {
        return null;
      }
    }
    return null;
  }, [codeString, lang]);

  return (
    <div className="my-4 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm font-mono text-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2 font-bold tracking-wider uppercase text-emerald-700">
          <Terminal size={14} />
          <span>{lang || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-slate-200 text-slate-700 transition-colors border border-slate-300 cursor-pointer font-semibold"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-600" />
              <span className="text-emerald-700 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 overflow-x-auto text-slate-800">
        {highlightedHtml ? (
          <pre
            className="m-0 leading-relaxed font-mono text-xs sm:text-sm"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre className="m-0 leading-relaxed font-mono text-xs sm:text-sm">
            {codeString}
          </pre>
        )}
      </div>
    </div>
  );
};

const markdownComponents = {
  // Headings
  h1: ({ children }) => (
    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-6 mb-3 pb-2 border-b border-slate-200 tracking-tight font-heading">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-5 mb-2.5 pb-1.5 border-b border-slate-200 tracking-tight font-heading">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-bold text-emerald-800 mt-4 mb-2 font-heading border-b border-slate-100 pb-1">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-base font-semibold text-emerald-700 mt-3 mb-1.5 font-heading">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="text-sm font-semibold text-slate-800 mt-2 mb-1">
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className="text-xs font-semibold text-slate-500 mt-2 mb-1 uppercase tracking-wider">
      {children}
    </h6>
  ),

  // Paragraphs & Inline Text
  p: ({ children }) => (
    <p className="my-2 text-slate-800 leading-relaxed font-body">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="text-slate-900 font-bold">
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="text-slate-700 italic">
      {children}
    </em>
  ),
  del: ({ children }) => (
    <del className="text-slate-400 line-through">
      {children}
    </del>
  ),

  // Links & Citation Badges
  a: ({ href, title, children }) => {
    if (href && href.startsWith('#cite:')) {
      const citationId = href.replace('#cite:', '');
      return (
        <span
          className="inline-flex items-center px-2 py-0.5 mx-1 rounded text-xs font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-help hover:bg-emerald-200 transition-colors shadow-sm font-medium"
          title={title || `Verified Knowledge Chunk: ${citationId}`}
        >
          {children}
        </span>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900 underline underline-offset-2 transition-colors font-semibold"
      >
        <span>{children}</span>
        <ExternalLink size={12} className="inline opacity-80" />
      </a>
    );
  },

  // Lists & Task Lists
  ul: ({ children }) => (
    <ul className="my-2.5 pl-5 list-disc space-y-1.5 text-slate-800">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2.5 pl-5 list-decimal space-y-1.5 text-slate-800">
      {children}
    </ol>
  ),
  li: ({ children, checked }) => {
    if (typeof checked === 'boolean') {
      return (
        <li className="list-none -ml-5 flex items-start gap-2.5 my-1.5 text-slate-800">
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="mt-1 rounded accent-emerald-600 cursor-default"
          />
          <span className="leading-relaxed">{children}</span>
        </li>
      );
    }
    return (
      <li className="my-1 text-slate-800 leading-relaxed">
        {children}
      </li>
    );
  },

  // Code & Code Blocks
  code: ({ inline, className, children, ...props }) => {
    if (!inline && (className || String(children).includes('\n'))) {
      return (
        <CodeBlock className={className} {...props}>
          {children}
        </CodeBlock>
      );
    }
    return (
      <code className="px-1.5 py-0.5 mx-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs sm:text-sm font-semibold">
        {children}
      </code>
    );
  },

  // Blockquotes
  blockquote: ({ children }) => (
    <blockquote className="my-4 pl-4 pr-3 py-3 border-l-4 border-emerald-600 bg-emerald-50/70 rounded-r-xl italic text-slate-800 flex gap-3">
      <Quote size={18} className="text-emerald-600 shrink-0 mt-0.5 opacity-80" />
      <div className="flex-1 space-y-1">{children}</div>
    </blockquote>
  ),

  // Tables
  table: ({ children }) => (
    <div className="my-4 w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse text-sm text-slate-800">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-xs">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-slate-100">
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-slate-50 transition-colors">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 font-bold text-slate-800">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-slate-700">
      {children}
    </td>
  ),

  // Horizontal Rule
  hr: () => (
    <hr className="my-6 border-t border-slate-200" />
  ),

  // Images
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt || ''}
      loading="lazy"
      className="my-4 max-w-full rounded-xl border border-slate-200 shadow-sm object-cover"
    />
  ),
};

export const MarkdownViewer = ({ text }) => {
  const processedText = useMemo(() => preprocessMarkdown(text || ''), [text]);

  if (!text) return null;

  return (
    <div className="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {processedText}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;
