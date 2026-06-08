import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBusiness } from '../context/BusinessContext'
import { useChat } from '../hooks/useChat'
import { ChatHeader } from '../components/chat/ChatHeader'
import { MessageBubble, TypingIndicator } from '../components/chat/MessageBubble'
import { QuickReplies } from '../components/chat/QuickReplies'
import { ChatInput } from '../components/chat/ChatInput'
import type { Business } from '../types'

// Página pública: www.emprendebot/[slug]
export function ChatbotPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { loadBusinessBySlug } = useBusiness()
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) { setNotFound(true); return }
    const found = loadBusinessBySlug(slug)
    if (found) setCurrentBusiness(found)
    else setNotFound(true)
  }, [slug, loadBusinessBySlug])

  const { messages, isTyping, sendMessage, reset } = useChat(currentBusiness)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  if (notFound) {
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

  if (!currentBusiness) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Cargando...</span>
      </div>
    )
  }

  // Últimas quick replies disponibles (del último mensaje bot con quickReplies)
  const lastBotWithReplies = [...messages].reverse().find(
    m => m.role === 'bot' && m.quickReplies && m.quickReplies.length > 0
  )
  const activeQuickReplies = isTyping ? [] : (lastBotWithReplies?.quickReplies ?? [])

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100svh',
      background: 'var(--color-bg-subtle)',
    }}>
      <ChatHeader
        business={currentBusiness}
        onRefresh={reset}
      />

      {/* Messages area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {messages.map(msg => (
          <div key={msg.id}>
            <MessageBubble message={msg} />
            {/* Quick replies solo del último mensaje bot */}
            {msg.id === messages[messages.length - 1]?.id &&
              msg.role === 'bot' &&
              !isTyping &&
              msg.quickReplies && msg.quickReplies.length > 0 && (
                <QuickReplies
                  options={msg.quickReplies}
                  onSelect={sendMessage}
                />
              )}
          </div>
        ))}

        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies flotantes si no hay en el último mensaje */}
      {!isTyping && activeQuickReplies.length > 0 &&
        messages[messages.length - 1]?.role !== 'bot' && (
          <div style={{ padding: '0 16px 4px', borderTop: '1px solid var(--color-border)' }}>
            <QuickReplies options={activeQuickReplies} onSelect={sendMessage} />
          </div>
        )}

      <ChatInput onSend={sendMessage} disabled={isTyping} />
    </div>
  )
}
