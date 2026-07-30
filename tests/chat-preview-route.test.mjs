import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const readSource = relativePath =>
  readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8')

const app = readSource('src/App.tsx')
const chatbotPage = readSource('src/pages/ChatbotPage.tsx')
const chatRoutes = readSource('src/utils/chatRoutes.ts')
const businessConfig = readSource('src/pages/BusinessConfigPage.tsx')
const previewEntryPoints = [
  'src/pages/DashboardPage.tsx',
  'src/pages/CatalogPage.tsx',
  'src/pages/ConsultasPage.tsx',
  'src/pages/FaqPage.tsx',
  'src/pages/BusinessConfigPage.tsx',
  'src/features/metrics/future/FutureMetricsPage.tsx',
].map(readSource)

test('el modo preview tiene una ruta protegida separada del enlace público', () => {
  assert.match(
    app,
    /path={CHAT_PREVIEW_ROUTE}[\s\S]*<ProtectedRoute><ChatbotPage preview \/><\/ProtectedRoute>/,
  )
  assert.match(app, /path={PUBLIC_CHAT_ROUTE} element={<ChatbotPage \/>}/)
  assert.match(chatRoutes, /CHAT_PREVIEW_ROUTE = '\/chat-preview\/:slug'/)
  assert.match(chatRoutes, /PUBLIC_CHAT_ROUTE = '\/:slug'/)
})

test('Reiniciar chat se habilita únicamente en modo preview', () => {
  assert.match(
    chatbotPage,
    /<ChatHeader business={business} onRefresh={preview \? reset : undefined} \/>/,
  )
})

test('todos los accesos Probá tu chat usan el mismo helper de preview', () => {
  for (const source of previewEntryPoints) {
    assert.match(source, /openChatPreview\(business\.slug\)/)
    assert.doesNotMatch(source, /window\.open\(`\/\${business\.slug}`/)
  }
})

test('el helper abre el preview en una pestaña nueva', () => {
  assert.match(
    chatRoutes,
    /window\.open\(getChatPreviewPath\(slug\), '_blank', 'noopener,noreferrer'\)/,
  )
})

test('el enlace copiado continúa usando exclusivamente la ruta pública', () => {
  assert.match(businessConfig, /getPublicChatUrl\(form\.slug, window\.location\.origin\)/)
  assert.match(chatRoutes, /getPublicChatPath = \(slug: string\)[\s\S]*`\/\${encodeSlug\(slug\)}`/)
  assert.doesNotMatch(businessConfig, /publicUrl[\s\S]{0,120}chat-preview/)
})
