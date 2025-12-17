
export interface ScrapedArticle {
  url: string;
  title: string;
  content: string;
  status: 'success' | 'error';
  error?: string;
}

export const scrapeArticles = async (urls: string[]): Promise<ScrapedArticle[]> => {
  const results: ScrapedArticle[] = [];

  for (const url of urls) {
    if (!url.trim()) continue;

    try {
      // Use a CORS proxy to bypass browser restrictions
      // Note: In a production environment, this should be done via a dedicated backend API
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url.trim())}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Basic cleanup
      const scripts = doc.querySelectorAll('script, style, iframe, nav, footer, header, aside, .ad, .advertisement, .popup');
      scripts.forEach(script => script.remove());

      // Attempt to find the main content
      const articleBody = doc.querySelector('article') || doc.querySelector('main') || doc.body;
      
      // Extract text content with some formatting preservation
      let textContent = '';
      if (articleBody) {
          // simple formatting: add newlines for block elements
          const blocks = articleBody.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
          blocks.forEach(block => {
              const text = block.textContent?.trim();
              if (text) textContent += text + '\n\n';
          });
          
          // Fallback if structured scraping fails
          if (!textContent.trim()) {
              textContent = articleBody.innerText;
          }
      }

      const title = doc.querySelector('title')?.textContent || 'No Title Found';

      results.push({
        url,
        title: title.trim(),
        content: textContent.trim(),
        status: 'success'
      });

    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      results.push({
        url,
        title: 'Error',
        content: '',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
};
