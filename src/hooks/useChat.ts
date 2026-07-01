import { useCallback, useEffect, useRef, useState } from 'react'
import type { AwaitingInput, Business, FAQ, Message } from '../types'
import {
  clearChatHistory,
  clearChatState,
  loadAwaitingInput,
  loadChatHistory,
  saveAwaitingInput,
  saveChatHistory,
} from '../services/chatStorage'

const QUICK_REPLIES_INICIAL = [
  'Ver catálogo',
  'Solicitar presupuesto',
  'Horarios e Información',
  'Preguntas frecuentes',
  'Dejar mis datos',
  'Hablar con una persona',
]

interface BotResponse {
  text: string
  quickReplies?: string[]
  continuation?: string
  awaitingInput?: AwaitingInput
}

const CONTINUATION_MESSAGES = [
  '¿Querés que te ayude con algo más?',
  'También puedo ayudarte con productos, horarios, presupuesto o contacto.',
]

const MENU_COMMANDS = ['menu', 'opciones', 'volver']

function normalizeMessage(message: string): string {
  return message
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function isMenuCommand(message: string): boolean {
  return MENU_COMMANDS.includes(message) || message === 'volver al menu' || message === 'menu principal'
}

function isFaqMenuCommand(message: string): boolean {
  return message === 'faq'
    || message === 'faqs'
    || message === 'volver a faq'
    || message === 'volver a faqs'
    || message === 'preguntas frecuentes'
    || message === 'ver preguntas frecuentes'
}

function getActiveFaqs(business: Business): FAQ[] {
  return business.faq
    .filter(faq => faq.activa)
    .sort((left, right) => (left.orden ?? 0) - (right.orden ?? 0))
}

function getFaqMenuText(faqs: FAQ[]): string {
  const numberedQuestions = faqs
    .map((faq, index) => `${index + 1}. ${faq.pregunta}`)
    .join('\n')

  return `Seleccioná qué querés saber escribiendo el número de la opción:\n\n${numberedQuestions}`
}

function createFaqMenuResponse(business: Business): BotResponse {
  const activeFaqs = getActiveFaqs(business)

  if (activeFaqs.length === 0) {
    return {
      text: 'No hay preguntas frecuentes activas en este momento. Podés volver al menú principal.',
      quickReplies: ['Menú principal'],
    }
  }

  return {
    text: getFaqMenuText(activeFaqs),
    awaitingInput: 'faq-selection',
  }
}

function findSelectedFaq(userMessage: string, faqs: FAQ[]): FAQ | null {
  const normalizedSelection = normalizeMessage(userMessage)
  if (!/^\d+$/.test(normalizedSelection)) return null

  const selectedIndex = Number(normalizedSelection) - 1
  return faqs[selectedIndex] ?? null
}

function generateBotResponse(
  userMessage: string,
  business: Business,
  awaitingInput: AwaitingInput | null,
): BotResponse {
  const msg = userMessage.toLowerCase()
  const normalizedMessage = normalizeMessage(userMessage)

  if (isMenuCommand(normalizedMessage)) {
    return {
      text: '',
      quickReplies: QUICK_REPLIES_INICIAL,
    }
  }

  if (isFaqMenuCommand(normalizedMessage)) {
    return createFaqMenuResponse(business)
  }

  if (awaitingInput === 'contact') {
    return {
      text: '¡Gracias! Registramos tus datos para que alguien del equipo pueda contactarte.',
      continuation: '¿Puedo ayudarte con algo más?',
    }
  }

  if (awaitingInput === 'budget') {
    return {
      text: '¡Gracias! Registramos el detalle de tu solicitud de presupuesto. El equipo podrá revisarlo y contactarte.',
      continuation: '¿Querés consultar algo más mientras tanto?',
    }
  }

  if (awaitingInput === 'faq-selection') {
    const activeFaqs = getActiveFaqs(business)
    if (activeFaqs.length === 0) return createFaqMenuResponse(business)

    const selectedFaq = findSelectedFaq(userMessage, activeFaqs)

    if (!selectedFaq) {
      return {
        text: `No encontré esa opción. Elegí un número válido de la lista.\n\n${getFaqMenuText(activeFaqs)}`,
        awaitingInput: 'faq-selection',
      }
    }

    return {
      text: selectedFaq.respuesta,
      quickReplies: ['Ver preguntas frecuentes', 'Volver al menú principal'],
    }
  }

  if (msg.includes('producto') || msg.includes('catálogo') || msg.includes('catalogo')) {
    if (business.productos.length === 0) {
      return {
        text: 'Todavía no tenemos productos cargados. ¿Te puedo ayudar con algo más?',
        quickReplies: QUICK_REPLIES_INICIAL,
      }
    }
    const lista = business.productos.map(p =>
      `• ${p.nombre}${p.precio ? ` - $${p.precio}` : ''}${p.descripcion ? `\n  ${p.descripcion}` : ''}`
    ).join('\n')
    return {
      text: `Nuestros productos disponibles:\n\n${lista}\n\n¿Querés más información sobre alguno?`,
      continuation: 'También puedo ayudarte con horarios, presupuesto o contacto.',
    }
  }

  if (msg.includes('horario') || msg.includes('información') || msg.includes('informacion')) {
    return {
      text: `📋 *Información de ${business.nombre}*\n\n🕐 Horario: ${business.horario || 'No especificado'}\n📞 Teléfono: ${business.telefono || 'No especificado'}\n\n${business.descripcion || ''}`,
    }
  }

  if (msg.includes('presupuesto')) {
    return {
      text: "¡Perfecto! Para armar un presupuesto necesito algunos datos. ¿Podés contarme qué productos o servicios te interesan?\n\nSi querés volver al menú principal, escribí 'menú' u 'opciones'.",
      awaitingInput: 'budget',
    }
  }

  if (msg.includes('datos') || msg.includes('contacto')) {
    return {
      text: "¡Perfecto! 😊\n\nDejame:\n• Tu nombre\n• Tu teléfono o email\n\nY alguien del equipo se pondrá en contacto con vos a la brevedad.\n\nSi querés volver al menú principal, escribí 'menú' u 'opciones'.",
      awaitingInput: 'contact',
    }
  }

  if (msg.includes('frecuente') || msg.includes('faq') || msg.includes('pregunta')) {
    return createFaqMenuResponse(business)
  }

  if (msg.includes('persona') || msg.includes('asesor') || msg.includes('hablar')) {
    return {
      text: business.respuestaDerivacion || 'Te voy a conectar con un asesor en breve. ¡Gracias por tu paciencia!',
      continuation: 'Mientras tanto, ¿querés consultar otra información del negocio?',
    }
  }

  return {
    text: `Entendido. Estoy aquí para ayudarte con información sobre ${business.nombre}. ¿Qué necesitás?`,
    quickReplies: QUICK_REPLIES_INICIAL,
  }
}

function createBotMessages(response: BotResponse): Message[] {
  const responseMessage: Message = {
    id: crypto.randomUUID(),
    role: 'bot',
    text: response.text,
    timestamp: new Date(),
    quickReplies: response.quickReplies,
  }

  if (response.awaitingInput || response.quickReplies?.length) return [responseMessage]

  const continuationMessage: Message = {
    id: crypto.randomUUID(),
    role: 'bot',
    text: response.continuation ?? CONTINUATION_MESSAGES[Math.floor(Math.random() * CONTINUATION_MESSAGES.length)],
    timestamp: new Date(),
    quickReplies: QUICK_REPLIES_INICIAL,
  }

  return [responseMessage, continuationMessage]
}

function createInitialMessage(business: Business): Message {
  return {
    id: crypto.randomUUID(),
    role: 'bot',
    text: business.mensajeBienvenida || `¡Hola! Soy el asistente virtual de ${business.nombre}. ¿En qué te puedo ayudar?`,
    timestamp: new Date(),
    quickReplies: QUICK_REPLIES_INICIAL,
  }
}

function getInitialHistory(business: Business): Message[] {
  const storedMessages = loadChatHistory(business.id)
  if (storedMessages.length > 0) return storedMessages

  const initialMessages = [createInitialMessage(business)]
  saveChatHistory(business.id, initialMessages)
  return initialMessages
}

const getTypingDelay = () => 800 + Math.floor(Math.random() * 701)

export function useChat(business: Business) {
  const [messages, setMessages] = useState<Message[]>(() => getInitialHistory(business))
  const [awaitingInput, setAwaitingInput] = useState<AwaitingInput | null>(() => loadAwaitingInput(business.id))
  const [isTyping, setIsTyping] = useState(false)
  const responseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingResponseResolverRef = useRef<(() => void) | null>(null)
  const conversationVersionRef = useRef(0)

  const cancelPendingResponse = useCallback(() => {
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current)
      responseTimeoutRef.current = null
    }
    pendingResponseResolverRef.current?.()
    pendingResponseResolverRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      conversationVersionRef.current += 1
      cancelPendingResponse()
    }
  }, [cancelPendingResponse])

  const sendMessage = useCallback(async (text: string) => {
    if (isTyping) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      timestamp: new Date(),
    }

    setMessages(previousMessages => {
      const nextMessages = [...previousMessages, userMessage]
      saveChatHistory(business.id, nextMessages)
      return nextMessages
    })
    setIsTyping(true)

    const conversationVersion = conversationVersionRef.current
    await new Promise<void>(resolve => {
      pendingResponseResolverRef.current = resolve
      responseTimeoutRef.current = setTimeout(() => {
        responseTimeoutRef.current = null
        pendingResponseResolverRef.current = null
        resolve()
      }, getTypingDelay())
    })

    if (conversationVersion !== conversationVersionRef.current) return

    const response = generateBotResponse(text, business, awaitingInput)
    const botMessages = createBotMessages(response)
    const nextAwaitingInput = response.awaitingInput ?? null

    setMessages(previousMessages => {
      const nextMessages = [...previousMessages, ...botMessages]
      saveChatHistory(business.id, nextMessages)
      return nextMessages
    })
    setAwaitingInput(nextAwaitingInput)
    saveAwaitingInput(business.id, nextAwaitingInput)
    setIsTyping(false)
  }, [awaitingInput, business, isTyping])

  const reset = useCallback(() => {
    conversationVersionRef.current += 1
    cancelPendingResponse()

    clearChatHistory(business.id)
    clearChatState(business.id)
    const initialMessages = [createInitialMessage(business)]
    setMessages(initialMessages)
    setAwaitingInput(null)
    saveChatHistory(business.id, initialMessages)
    setIsTyping(false)
  }, [business, cancelPendingResponse])

  return { messages, isTyping, sendMessage, reset }
}
