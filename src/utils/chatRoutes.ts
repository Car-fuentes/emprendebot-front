export const CHAT_PREVIEW_ROUTE = '/chat-preview/:slug'
export const PUBLIC_CHAT_ROUTE = '/:slug'

const encodeSlug = (slug: string) => encodeURIComponent(slug.trim())

export const getChatPreviewPath = (slug: string) =>
  `/chat-preview/${encodeSlug(slug)}`

export const getPublicChatPath = (slug: string) =>
  `/${encodeSlug(slug)}`

export const getPublicChatUrl = (slug: string, origin: string) =>
  `${origin.replace(/\/+$/, '')}${getPublicChatPath(slug)}`

export const openChatPreview = (slug: string) => {
  window.open(getChatPreviewPath(slug), '_blank', 'noopener,noreferrer')
}
