import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const readSource = relativePath =>
  readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8')

const types = readSource('src/types/index.ts')
const useChat = readSource('src/hooks/useChat.ts')
const chatbotPage = readSource('src/pages/ChatbotPage.tsx')
const quickReplies = readSource('src/components/chat/QuickReplies.tsx')
const publicApi = readSource('src/services/publicConsultationApi.ts')

test('las quick replies tienen identidad y acción independientes del label', () => {
  assert.match(types, /interface QuickReplyOption[\s\S]*id: string[\s\S]*label: string[\s\S]*action: QuickReplyAction/)
  assert.match(types, /quickReplies\?: QuickReplyOption\[\]/)
  assert.match(quickReplies, /key={option\.id}/)
  assert.match(quickReplies, /{option\.label}/)
  assert.match(quickReplies, /ICON_MAP\[option\.action\]/)
  assert.doesNotMatch(quickReplies, /ICON_MAP\[option\.label\]/)
})

test('volver al menú después de FAQ ejecuta SHOW_MAIN_MENU sin reinterpretar el label', () => {
  assert.match(useChat, /id: 'back-main-menu'[\s\S]*label: 'Volver al menú principal'[\s\S]*action: 'SHOW_MAIN_MENU'/)
  assert.match(useChat, /SHOW_MAIN_MENU: createMainMenuResponse/)
  assert.match(useChat, /quickReply\s*\? generateQuickReplyResponse\(quickReply, business\)/)
  assert.match(useChat, /processMessage\(option\.label, option\)/)
  assert.doesNotMatch(chatbotPage, /sendMessage\('Volver al menú principal'\)/)
})

test('las acciones de FAQ y catálogo están migradas', () => {
  assert.match(useChat, /id: 'repeat-faq-menu'[\s\S]*action: 'SHOW_FAQ_MENU'/)
  assert.match(useChat, /SHOW_FAQ_MENU: \(\) => createFaqMenuResponse\(business\)/)
  assert.match(chatbotPage, /id: 'catalog-back-main-menu'[\s\S]*action: 'SHOW_MAIN_MENU'/)
  assert.match(chatbotPage, /onSelect={handleQuickReply}/)
  assert.match(chatbotPage, /action: 'SELECT_FAQ'/)
  assert.match(useChat, /SELECT_FAQ: \(\) => createSelectedFaqResponse\(option\.value, business\)/)
})

test('la confirmación de presupuesto usa una acción interna estable', () => {
  assert.match(chatbotPage, /id: 'confirm-budget'[\s\S]*action: 'CONFIRM_BUDGET'/)
  assert.match(useChat, /quickReply\?\.action === 'CONFIRM_BUDGET'/)
  assert.doesNotMatch(chatbotPage, /onClick=\{\(\) => sendMessage\('Confirmar presupuesto'\)\}/)
})

test('el texto libre conserva los comandos de menú', () => {
  assert.match(useChat, /function isMenuCommand/)
  assert.match(useChat, /generateBotResponse\(text, business, awaitingInput\)/)
  assert.match(useChat, /message === 'volver al menu principal'/)
})

test('seleccionar una quick reply registra una sola vez el label y no altera el contrato API', () => {
  assert.match(useChat, /const processMessage = useCallback\(async \(text: string, quickReply\?: QuickReplyOption\)/)
  assert.match(useChat, /const userMessage: Message = \{[\s\S]*text,[\s\S]*\}/)
  assert.match(useChat, /savePublicMessage\(business\.slug, consultationId, 'cliente', text\)/)
  assert.equal((useChat.match(/processMessage\(option\.label, option\)/g) ?? []).length, 1)
  assert.match(publicApi, /body: JSON\.stringify\(\{ emisor, contenido, tipoMensaje: 'texto' \}\)/)
})
