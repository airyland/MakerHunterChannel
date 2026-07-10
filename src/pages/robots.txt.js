export const prerender = false

// Served dynamically so the Sitemap directive is an absolute URL
// (sitemaps.org requires it; relative paths may be ignored by strict crawlers).
export async function GET(Astro) {
  const url = new URL(Astro.request.url)

  const body = `User-agent: *
Allow: /

Sitemap: ${url.origin}/sitemap.xml
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
