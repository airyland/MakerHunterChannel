export function onRequest(context, next) {
  context.locals.SITE_URL = `${import.meta.env.SITE ?? ''}${import.meta.env.BASE_URL}`

  // Canonicalize trailing slashes (e.g. /posts/43/ -> /posts/43) so URLs do
  // not fork between the trailing and non-trailing variants.
  const base = import.meta.env.BASE_URL || '/'
  const url = new URL(context.request.url)
  if (url.pathname !== base && url.pathname.length > 1 && url.pathname.endsWith('/')) {
    return context.redirect(url.pathname.replace(/\/+$/, '') + url.search, 301)
  }

  return next()
};
