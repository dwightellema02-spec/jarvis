/**
 * JARVIS Phase 8 - Academic & Scientific Citation Engine
 * Formats citations in APA (7th ed), IEEE, Chicago (17th ed), Harvard, and BibTeX.
 */

import { ResearchSource, CitationFormat, FormattedCitation } from './research.interface.js';

export class CitationEngine {
  /**
   * Generates citations in all supported formats for a given source.
   */
  public generateAllCitations(source: ResearchSource, index = 1): FormattedCitation[] {
    const formats: CitationFormat[] = ['APA', 'IEEE', 'CHICAGO', 'HARVARD', 'BIBTEX'];
    return formats.map((format) => ({
      sourceId: source.id,
      format,
      citationString: this.formatCitation(source, format, index),
    }));
  }

  /**
   * Formats a single citation according to requested style.
   */
  public formatCitation(source: ResearchSource, format: CitationFormat, index = 1): string {
    const authors = source.authors && source.authors.length > 0 ? source.authors : ['Anonymous'];
    const year = source.publishedYear || new Date().getFullYear();
    const title = source.title || 'Untitled Work';
    const publisher = source.publisher || 'Unknown Publisher';
    const doiUrl = source.doi ? `https://doi.org/${source.doi}` : source.url || '';

    switch (format) {
      case 'APA': {
        // Author, A. A., & Author, B. B. (Year). Title of work. Publisher. DOI/URL
        const authorStr = this.formatAuthorsAPA(authors);
        return `${authorStr} (${year}). *${title}*. ${publisher}.${doiUrl ? ' ' + doiUrl : ''}`;
      }

      case 'IEEE': {
        // [#] A. Author and B. Author, "Title," Publisher, Year. [Online]. Available: URL
        const authorStr = this.formatAuthorsIEEE(authors);
        const urlPart = doiUrl ? ` [Online]. Available: ${doiUrl}` : '';
        return `[${index}] ${authorStr}, "${title}," *${publisher}*, ${year}.${urlPart}`;
      }

      case 'CHICAGO': {
        // Author, First. "Title." Publisher, Year. URL.
        const authorStr = this.formatAuthorsChicago(authors);
        return `${authorStr}. "${title}." ${publisher}, ${year}.${doiUrl ? ' ' + doiUrl : ''}`;
      }

      case 'HARVARD': {
        // Author, A.A., Year. Title. Place: Publisher. Available at: URL.
        const authorStr = this.formatAuthorsHarvard(authors);
        const urlPart = doiUrl ? ` Available at: <${doiUrl}>` : '';
        return `${authorStr}, ${year}. *${title}*. ${publisher}.${urlPart}`;
      }

      case 'BIBTEX': {
        // @article{key, author = {...}, title = {...}, year = {...}, publisher = {...}}
        const citeKey = this.generateBibtexKey(authors[0], year, title);
        const authorBib = authors.join(' and ');
        return `@misc{${citeKey},\n  author = {${authorBib}},\n  title = {${title}},\n  year = {${year}},\n  publisher = {${publisher}},\n  url = {${doiUrl}}\n}`;
      }

      default:
        return `${authors.join(', ')} (${year}). ${title}. ${publisher}.`;
    }
  }

  // --- Author Formatting Helpers ---
  private formatAuthorsAPA(authors: string[]): string {
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
    if (authors.length <= 20) {
      return `${authors.slice(0, -1).join(', ')}, & ${authors[authors.length - 1]}`;
    }
    return `${authors.slice(0, 19).join(', ')}, ... ${authors[authors.length - 1]}`;
  }

  private formatAuthorsIEEE(authors: string[]): string {
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
    return `${authors[0]} *et al.*`;
  }

  private formatAuthorsChicago(authors: string[]): string {
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
    return `${authors[0]} et al.`;
  }

  private formatAuthorsHarvard(authors: string[]): string {
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
    return `${authors[0]} et al.`;
  }

  private generateBibtexKey(firstAuthor: string, year: number, title: string): string {
    const lastName = firstAuthor.split(' ').pop()?.toLowerCase().replace(/[^a-z]/g, '') || 'source';
    const firstTitleWord = title.split(' ')[0]?.toLowerCase().replace(/[^a-z]/g, '') || 'work';
    return `${lastName}${year}${firstTitleWord}`;
  }
}
