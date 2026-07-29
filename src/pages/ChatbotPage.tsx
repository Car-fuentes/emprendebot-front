import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChatHeader } from '../components/chat/ChatHeader'
import { ChatInput } from '../components/chat/ChatInput'
import { MessageBubble, TypingIndicator } from '../components/chat/MessageBubble'
import { FaqListMessage } from '../components/chat/FaqListMessage'
import { ProductCatalogMessage } from '../components/chat/ProductCatalogMessage'
import { QuickReplies } from '../components/chat/QuickReplies'
import { QuoteSummaryCard } from '../components/chat/QuoteSummaryCard'
import { GeneratedQuoteCard } from '../components/chat/GeneratedQuoteCard'
import '../components/chat/quoteCards.css'
import { useChat } from '../hooks/useChat'
import type { Business, FAQ, Product } from '../types'
import { getPublicBusinessApi, getPublicFaqsApi, getPublicProductsApi } from '../services/publicApi'
import { resolveChatAppearance } from '../services/chatAppearance'

// Página pública: www.emprendebot/[slug]
export function ChatbotPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [business, setBusiness] = useState<Business | null>(null)
  const [isBusinessLoading, setIsBusinessLoading] = useState(Boolean(slug))
  const [publicFaqs, setPublicFaqs] = useState<FAQ[] | null>(null)
  const [publicProducts, setPublicProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    if (!slug) return
    getPublicBusinessApi(slug)
      .then(setBusiness)
      .catch(() => setBusiness(null))
      .finally(() => setIsBusinessLoading(false))
  }, [slug])

  useEffect(() => {
    if (!slug) return
    getPublicFaqsApi(slug)
      .then(faqs => setPublicFaqs(faqs))
      .catch(() => setPublicFaqs([]))

    getPublicProductsApi(slug)
      .then(products => setPublicProducts(products))
      // Compatibilidad: si el endpoint todavía no existe, se conservan
      // los productos incluidos por /init.
      .catch(() => setPublicProducts(null))
  }, [slug])

  if (isBusinessLoading && !business) {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        color: 'var(--color-text-secondary)', fontSize: '14px',
      }}>
        Cargando chatbot...
      </div>
    )
  }

  if (!business) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', textAlign: 'center', gap: '16px',
      }}>
        <span style={{ fontSize: '48px' }}>🔍</span>
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Negocio no encontrado</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          El link que buscás no existe o fue desactivado.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            color: 'var(--color-primary)', fontWeight: 600,
            border: 'none', background: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-family)', fontSize: '14px',
          }}
        >
          ← Volver al inicio
        </button>
      </div>
    )
  }

  const publicBusiness: Business = {
    ...business,
    ...(publicFaqs !== null ? { faq: publicFaqs } : {}),
    ...(publicProducts !== null ? { productos: publicProducts } : {}),
  }

  return <PublicChat key={business.id} business={publicBusiness} />
}

function PublicChat({ business }: { business: Business }) {
  const {
    messages,
    isTyping,
    sendMessage,
    submitOrder,
    requestQuote,
    submittingQuoteMessageId,
    reset,
  } = useChat(business)
  const appearance = resolveChatAppearance(business)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isInitialScrollRef = useRef(true)

  useEffect(() => {
    document.documentElement.classList.add('public-chat-active')
    document.body.classList.add('public-chat-active')

    return () => {
      document.documentElement.classList.remove('public-chat-active')
      document.body.classList.remove('public-chat-active')
    }
  }, [])

  useEffect(() => {
    const container = messagesContainerRef.current
    const endMarker = messagesEndRef.current
    if (!container || !endMarker) return

    let secondFrame = 0
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        container.scrollTo({
          top: endMarker.offsetTop,
          behavior: isInitialScrollRef.current ? 'auto' : 'smooth',
        })
        isInitialScrollRef.current = false
      })
    })

    return () => {
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
    }
  }, [messages, isTyping])

  const lastProductsMessageId = [...messages].reverse().find(m => m.products?.length)?.id
  const lastFaqsMessageId = [...messages].reverse().find(m => m.faqs?.length)?.id

  const lastBotWithReplies = [...messages].reverse().find(
    message => message.role === 'bot' && message.quickReplies && message.quickReplies.length > 0
  )
  const activeQuickReplies = isTyping ? [] : (lastBotWithReplies?.quickReplies ?? [])

  return (
    <div
      className="public-chat"
      style={{
        '--chat-primary': appearance.primary,
        '--chat-secondary': appearance.secondary,
        '--chat-gradient': `linear-gradient(90deg, ${appearance.primary}, ${appearance.secondary})`,
        '--color-primary': appearance.primary,
        '--color-secondary': appearance.secondary,
        '--color-bg-answer': appearance.primary,
      } as CSSProperties}
    >
      <ChatHeader business={business} onRefresh={reset} />

      <div ref={messagesContainerRef} className="public-chat__messages">
        {messages.map(message => (
          <div key={message.id}>
            {message.text && <MessageBubble message={message} />}
            {message.quoteSummary && (
              <QuoteSummaryCard
                data={message.quoteSummary}
                isSubmitting={submittingQuoteMessageId === message.id}
                isSubmitted={messages.some(
                  candidate => candidate.generatedQuote?.sourceSummaryMessageId === message.id,
                )}
                onContinue={() => void requestQuote(message.id, message.quoteSummary!)}
              />
            )}
            {message.generatedQuote && (
              <GeneratedQuoteCard data={message.generatedQuote} businessName={business.nombre} />
            )}
            {message.confirmQuote &&
              message.id === messages[messages.length - 1]?.id &&
              !isTyping && (
                <div style={{ margin: '4px 0 12px 44px', width: 'calc(100% - 44px)', maxWidth: 520 }}>
                  <button
                    type="button"
                    onClick={() => sendMessage('Confirmar presupuesto')}
                    style={{
                      width: '100%',
                      minHeight: 42,
                      padding: '10px 16px',
                      border: 0,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--chat-gradient)',
                      color: '#fff',
                      font: '700 14px var(--font-family)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    Confirmar presupuesto
                  </button>
                </div>
              )}
            {message.products && message.products.length > 0 && message.id === lastProductsMessageId && !isTyping && (
              <ProductCatalogMessage products={message.products} onConfirm={submitOrder} onBack={() => sendMessage('Volver al menú principal')} />
            )}
            {message.faqs && message.faqs.length > 0 && message.id === lastFaqsMessageId && !isTyping && (
              <FaqListMessage faqs={message.faqs} onSelect={sendMessage} />
            )}
            {message.id === messages[messages.length - 1]?.id &&
              message.role === 'bot' &&
              !isTyping &&
              message.quickReplies && message.quickReplies.length > 0 && (
                <QuickReplies options={message.quickReplies} onSelect={sendMessage} />
              )}
          </div>
        ))}

        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} className="public-chat__end" aria-hidden="true" />
      </div>

      {!isTyping && activeQuickReplies.length > 0 &&
        messages[messages.length - 1]?.role !== 'bot' && (
          <div className="public-chat__suggestions">
            <QuickReplies options={activeQuickReplies} onSelect={sendMessage} />
          </div>
        )}

      <ChatInput onSend={sendMessage} disabled={isTyping} />
    </div>
  )
}
