// Wikipedia source adapter (works for any language edition via `lang`).
//
// Wikipedia's API is explicitly bot-friendly, license-clean (CC/GFDL), and
// needs no API key. We pull the article *wikitext*, split it into sections by
// its "== Heading ==" markers, and convert each meaningful section into a
// general_faqs record. Titles are resolved via the search API so language
// editions with different article names still work.
import { SourceAdapter, fetchWithRetry, sleep } from './base.js';
import { PIPELINE_CONFIG } from '../config.js';
import { splitWikiSections, cleanWikiText, headingToQuestion } from '../utils/wiki.js';

export class WikipediaSource extends SourceAdapter {
  constructor({ lang = 'en', label = 'wikipedia', articles = [] } = {}) {
    super(label, 'general_faqs');
    this.lang = lang;
    this.articles = articles; // [{ title, category }]
    this.api = `https://${lang}.wikipedia.org/w/api.php`;
  }

  // Resolve a (possibly imprecise) title to the best-matching article title
  // via the search API. Falls back to the original title if search fails.
  async resolveTitle(title, logger) {
    const url =
      `${this.api}?action=query&list=search&srsearch=` +
      `${encodeURIComponent(title)}&srlimit=1&format=json`;
    const json = await fetchWithRetry(this, url, logger);
    const hit = json?.query?.search?.[0];
    return hit?.title || title;
  }

  // Fetch the full wikitext of one article (parse module returns it in a
  // single response — no pagination tokens needed).
  async fetchArticleWikitext(title, logger) {
    const url =
      `${this.api}?action=parse&page=${encodeURIComponent(title)}` +
      `&prop=wikitext&format=json&redirects=1`;
    const json = await fetchWithRetry(this, url, logger);
    if (!json?.parse?.wikitext) return '';
    return json.parse.wikitext['*'] || '';
  }

  async fetchRecords(logger) {
    const records = [];
    for (const art of this.articles) {
      const title = this.lang === 'en'
        ? art.title
        : await this.resolveTitle(art.title, logger);
      if (this.lang !== 'en') await sleep(PIPELINE_CONFIG.requestDelayMs);

      // Safety gate: if an article resolves to a title lacking any expected
      // keyword, skip it. Prevents off-topic scrapes (e.g. a search returning
      // an unrelated article) from polluting the dataset.
      if (art.requireKeywords && title) {
        const low = title.toLowerCase();
        const ok = art.requireKeywords.some((k) => low.includes(k.toLowerCase()));
        if (!ok) {
          console.warn(`  ⚠ [${this.name}] skipped "${art.title}" — resolved to off-topic "${title}"`);
          continue;
        }
      }
      console.log(`  ↳ [${this.name}] using article: ${title}`);

      const wikitext = await this.fetchArticleWikitext(title, logger);
      await sleep(PIPELINE_CONFIG.requestDelayMs);

      if (!wikitext) {
        console.warn(`  ⚠ [${this.name}] no content for "${art.title}" (resolved: "${title}")`);
        continue;
      }

      const sections = splitWikiSections(wikitext);
      let added = 0;
      for (const sec of sections) {
        const heading = sec.heading.trim();
        const body = cleanWikiText(sec.body);
        if (PIPELINE_CONFIG.ignoredSections.has(heading.toLowerCase())) continue;
        if (body.length < 60) continue;
        records.push({
          category: art.category,
          question: headingToQuestion(heading, art.category),
          answer: body.slice(0, 1800),
        });
        added++;
        if (added >= PIPELINE_CONFIG.maxRecordsPerArticle) break;
      }
      if (records.length >= PIPELINE_CONFIG.maxRecordsPerSource) break;
    }
    return records;
  }
}

export default WikipediaSource;
