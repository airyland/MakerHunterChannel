// Shared SEO helpers so that meta, OpenGraph, RSS and JSON-LD all derive
// their text and structured data from a single place (no parallel logic).

// Strip bare URLs and collapse whitespace so channel/post descriptions read
// cleanly in <title>, <meta description>, OpenGraph and RSS.
export function cleanDescription(input, maxLength = 160) {
  return (input ?? '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

// WebSite + Person graph injected on every page.
export function buildWebSiteSchema({ siteUrl, name, description, locale, sameAs = [], searchUrl }) {
  const website = {
    '@type': 'WebSite',
    '@id': `${siteUrl}#website`,
    'url': siteUrl,
    'name': name,
    'publisher': { '@id': `${siteUrl}#person` },
  }
  if (description) {
    website.description = description
  }
  if (locale) {
    website.inLanguage = locale
  }
  if (searchUrl) {
    website.potentialAction = {
      '@type': 'SearchAction',
      'target': `${searchUrl}?q={query}`,
      'query-input': 'required name=query',
    }
  }

  const person = {
    '@type': 'Person',
    '@id': `${siteUrl}#person`,
    'name': name,
    'url': siteUrl,
  }
  if (sameAs.length > 0) {
    person.sameAs = sameAs
  }

  return { '@context': 'https://schema.org', '@graph': [website, person] }
}

// SocialMediaPosting for a single post detail page.
export function buildPostSchema({ siteUrl, postUrl, headline, articleBody, datePublished, locale }) {
  const post = {
    '@context': 'https://schema.org',
    '@type': 'SocialMediaPosting',
    '@id': `${postUrl}#post`,
    'url': postUrl,
    'author': { '@id': `${siteUrl}#person` },
    'publisher': { '@id': `${siteUrl}#person` },
    'isPartOf': { '@id': `${siteUrl}#website` },
  }
  if (headline) {
    post.headline = headline
  }
  if (datePublished) {
    post.datePublished = datePublished
    post.dateModified = datePublished
  }
  if (locale) {
    post.inLanguage = locale
  }
  if (articleBody) {
    post.articleBody = articleBody
  }
  return post
}

export function buildBreadcrumbSchema({ siteUrl, siteName, postUrl, postName }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': siteName, 'item': siteUrl },
      { '@type': 'ListItem', 'position': 2, 'name': postName, 'item': postUrl },
    ],
  }
}
