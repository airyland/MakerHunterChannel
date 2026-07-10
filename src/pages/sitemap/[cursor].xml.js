import { getChannelInfo } from '../../lib/telegram'

export const prerender = false

export async function GET(Astro) {
  const request = Astro.request
  const url = new URL(request.url)
  const channel = await getChannelInfo(Astro, {
    before: Astro.params.cursor,
  })
  const posts = channel.posts || []

  // The sitemap index names its first shard after the latest post id.
  // Include the homepage on that first shard so `/` is covered exactly once.
  const latest = await getChannelInfo(Astro)
  const latestPost = latest.posts?.[0]
  const isFirstShard = latestPost && +Astro.params.cursor === +latestPost.id
  const homeUrl = isFirstShard
    ? `
    <url>
      <loc>${url.origin}/</loc>
      <lastmod>${new Date(latestPost.datetime).toISOString()}</lastmod>
    </url>
  `
    : ''

  const xmlUrls = homeUrl + posts.map(post => `
    <url>
      <loc>${url.origin}/posts/${post.id}</loc>
      <lastmod>${new Date(post.datetime).toISOString()}</lastmod>
    </url>
  `).join('')

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${xmlUrls}
</urlset>`, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
