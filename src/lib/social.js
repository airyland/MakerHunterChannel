import { getEnv } from './env'

// Single source of truth for the channel's external social profiles.
// Used both by the header icons and by the JSON-LD `sameAs` list so the
// two never drift apart.
export function getSocialProfiles(env, Astro) {
  const TWITTER = getEnv(env, Astro, 'TWITTER')
  const GITHUB = getEnv(env, Astro, 'GITHUB')
  const TELEGRAM = getEnv(env, Astro, 'TELEGRAM')
  const DISCORD = getEnv(env, Astro, 'DISCORD')
  const MASTODON = getEnv(env, Astro, 'MASTODON')
  const BLUESKY = getEnv(env, Astro, 'BLUESKY')

  const profiles = []
  if (TWITTER && TWITTER.length > 0) {
    profiles.push({ key: 'twitter', title: 'Twitter', label: `twitter.com/${TWITTER}`, url: `https://twitter.com/${TWITTER}` })
  }
  if (GITHUB && GITHUB.length > 0) {
    profiles.push({ key: 'github', title: 'GitHub', label: `github.com/${GITHUB}`, url: `https://github.com/${GITHUB}` })
  }
  if (TELEGRAM && TELEGRAM.length > 0) {
    profiles.push({ key: 'telegram', title: 'Telegram', label: `t.me/${TELEGRAM}`, url: `https://t.me/${TELEGRAM}` })
  }
  if (DISCORD && DISCORD.length > 0) {
    profiles.push({ key: 'discord', title: 'Discord', label: 'Discord Invite', url: DISCORD })
  }
  if (MASTODON && MASTODON.length > 0) {
    profiles.push({ key: 'mastodon', title: 'Mastodon', label: `@${MASTODON}`, url: `https://${MASTODON}` })
  }
  if (BLUESKY && BLUESKY.length > 0) {
    profiles.push({ key: 'bluesky', title: 'BlueSky', label: `@${BLUESKY}`, url: `https://bsky.app/profile/${BLUESKY}` })
  }
  return profiles
}

export function getSameAs(env, Astro) {
  return getSocialProfiles(env, Astro).map(profile => profile.url)
}
