async function fetchArticleText(url = '') {
  if (!url || !url.startsWith('http')) {
    return null;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'StillAfloatEditorialAgent/1.0'
      }
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return cleaned.slice(0, 12000);
  } catch (error) {
    console.error('Article extraction failed', url, error.message);
    return null;
  }
}

async function enrichStoriesWithArticles(stories = []) {
  const enriched = [];

  for (const story of stories) {
    const articleText = await fetchArticleText(story.link);

    enriched.push({
      ...story,
      articleText,
      hasFullText: Boolean(articleText)
    });
  }

  return enriched;
}

module.exports = {
  enrichStoriesWithArticles
};