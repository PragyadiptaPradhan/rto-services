// Helpers to turn MediaWiki wikitext into clean FAQ sections.
//
// NOTE: We fetch the article's *wikitext* (not the plaintext extract) because
// wikitext preserves "== Heading ==" markers that the plaintext extract strips.
// Those markers are what let us split an article into labelled sections.

// Split wikitext into { heading, body } sections using "=+ Heading =+" markers
// at any level (== or ===). Content before the first heading becomes an
// "Overview" section.
export function splitWikiSections(text) {
  const lines = String(text || '').split('\n');
  const sections = [];
  let current = { heading: 'Overview', body: '' };

  for (const line of lines) {
    const m = line.match(/^=+\s+(.+?)\s+=+\s*$/); // any heading level
    if (m) {
      sections.push(current);
      current = { heading: m[1], body: '' };
    } else {
      current.body += line + '\n';
    }
  }
  sections.push(current);
  return sections;
}

// Strip MediaWiki / HTML cruft from a section body into clean prose.
// Designed to be idempotent so re-cleaning stored records is safe.
export function cleanWikiText(s) {
  let t = String(s || '')
    .normalize('NFKC')
    .replace(/'''?/g, '')                                       // bold / italic
    .replace(/\[\[(?:File|Image|Category):[\s\S]*?\]\]/gi, '')   // files/images/cats (whole link)
    .replace(/\[\[[^\]|]+?\|([^\]]+?)\]\]/g, '$1')               // [[a|b]] -> b
    .replace(/\[\[([^\]]+?)\]\]/g, '$1')                         // [[a]]   -> a
    .replace(/\[\[|\]\]/g, '')                                    // any leftover link brackets
    .replace(/\[https?:\/\/[^\]]*\]/g, '');                      // bare external links

  // Iteratively strip wiki tables {| ... |} and templates {{ ... }} so that
  // nested structures are fully removed (a single pass leaves residue).
  for (let i = 0; i < 6; i++) {
    t = t.replace(/\{\|[\s\S]*?\|\}/g, '').replace(/\{\{[\s\S]*?\}\}/g, '');
  }
  // Strip any leftover table-cell / header rows (lines starting with | or !)
  // and row separators. These survive when a table wasn't fully enclosed.
  t = t.replace(/^\s*[\|\!][^\n]*\n?/gm, '').replace(/^\s*\|-[^\n]*\n?/gm, '');
  // Final sweep: zap any unpaired wiki tokens that survived above.
  t = t.replace(/\{\{|\}\}|\{\||\|\}/g, '');

  t = t
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '')                  // <ref>...</ref>
    .replace(/<[^>]+>/g, '')                                      // any remaining tags
    .replace(/\[(?:[0-9]+|citation needed)\]/gi, '')              // [1] / [citation needed]
    .replace(/^=+\s.*\s=+$/gm, '')                                // leftover heading lines
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim()
    .replace(/^[\s,;:\-–—{}|]+/, '')                             // leading junk (stray }}, ||, etc.)
    .replace(/[\s,;:\-–—{}|]+$/, '');                            // trailing junk
  return t;
}

// Build a natural-language question from a section heading + topic category.
export function headingToQuestion(heading, category) {
  const h = heading.trim();
  if (/^(overview|introduction|summary)$/i.test(h)) {
    return `Give me an overview of ${category} in India.`;
  }
  return `Can you explain "${h}" in the context of ${category}?`;
}
