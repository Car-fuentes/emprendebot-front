import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  AwaitingInput,
  Business,
  FAQ,
  Message,
  Product,
  QuoteSummaryMessageData,
} from '../types'

export interface OrderItem {
  product: Product
  quantity: number
}
import {
  clearChatHistory,
  clearChatState,
  loadAwaitingInput,
  loadChatHistory,
  saveAwaitingInput,
  saveChatHistory,
} from '../services/chatStorage'
import {
  createPublicBudget,
  createPublicConsultation,
  getPublicHistory,
  savePublicMessage,
  updatePublicContact,
} from '../services/publicConsultationApi'

const QUICK_REPLIES_INICIAL = [
  'Ver catálogo',
  'Horarios de atención',
  'Preguntas frecuentes',
  'Hablar con una persona',
]

interface BotResponse {
  text: string
  quickReplies?: string[]
  continuation?: string
  awaitingInput?: AwaitingInput
  products?: Product[]
  faqs?: FAQ[]
}

const CONTINUATION_MESSAGE = '¿Deseas realizar otra consulta?'

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
  return business.faq.filter(faq => faq.activa)
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
    text: 'Estas son las preguntas más frecuentes. Seleccioná la que te interese.',
    faqs: activeFaqs,
    quickReplies: QUICK_REPLIES_INICIAL,
    awaitingInput: 'faq-selection',
  }
}

function findSelectedFaq(userMessage: string, faqs: FAQ[]): FAQ | null {
  const normalized = normalizeMessage(userMessage)

  // Match por número (legado)
  if (/^\d+$/.test(normalized)) {
    return faqs[Number(normalized) - 1] ?? null
  }

  // Match por texto de la pregunta (cuando el usuario hace clic en el botón)
  return faqs.find(faq => normalizeMessage(faq.pregunta) === normalized) ?? null
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

  if (awaitingInput === 'budget') {
    return {
      text: '¡Gracias! Registramos el detalle de tu solicitud de presupuesto. El equipo podrá revisarlo y contactarte.',
      continuation: CONTINUATION_MESSAGE,
    }
  }

  if (awaitingInput === 'faq-selection') {
    const activeFaqs = getActiveFaqs(business)
    if (activeFaqs.length === 0) return createFaqMenuResponse(business)

    const selectedFaq = findSelectedFaq(userMessage, activeFaqs)

    if (!selectedFaq) {
      return {
        text: 'No encontré esa opción. Por favor elegí una de las preguntas de la lista.',
        faqs: activeFaqs,
        quickReplies: QUICK_REPLIES_INICIAL,
        awaitingInput: 'faq-selection',
      }
    }

    return {
      text: selectedFaq.respuesta,
      quickReplies: ['Ver preguntas frecuentes', 'Volver al menú principal'],
    }
  }

  if (msg.includes('producto') || msg.includes('catálogo') || msg.includes('catalogo')) {
    const disponibles = business.productos.filter(p => p.disponible)
    if (disponibles.length === 0) {
      return {
        text: 'Todavía no tenemos productos cargados. ¿Deseas realizar otra consulta?',
        quickReplies: QUICK_REPLIES_INICIAL,
      }
    }
    return {
      text: '¡Perfecto! Te comparto las opciones disponibles. Seleccioná una o varias para continuar.',
      products: disponibles,
    }
  }

  if (msg.includes('horario') || msg.includes('información') || msg.includes('informacion')) {
    return {
      text: `🕐 Horario: ${business.horario || 'No especificado'}\n📞 Teléfono: ${business.telefono || 'No especificado'}\n\n${business.descripcion || ''}`,
    }
  }

  if (msg.includes('presupuesto')) {
    return {
      text: "¡Perfecto! Para armar un presupuesto necesito algunos datos. ¿Podés contarme qué productos o servicios te interesan?\n\nSi querés volver al menú principal, escribí 'menú' u 'opciones'.",
      awaitingInput: 'budget',
    }
  }


  if (msg.includes('frecuente') || msg.includes('faq') || msg.includes('pregunta')) {
    return createFaqMenuResponse(business)
  }

  if (msg.includes('persona') || msg.includes('asesor') || msg.includes('hablar')) {
    return {
      text: '¡Perfecto! Para ponerte en contacto con una persona del negocio necesito un par de datos. 😊\n\n¿Cuál es tu nombre?',
      awaitingInput: 'contact-name',
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
    products: response.products,
    faqs: response.faqs,
  }

  if (response.awaitingInput || response.quickReplies?.length || response.products?.length || response.faqs?.length) return [responseMessage]

  const continuationMessage: Message = {
    id: crypto.randomUUID(),
    role: 'bot',
    text: response.continuation ?? CONTINUATION_MESSAGE,
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
const pendingQuoteStorageKey = (businessId: string) => `eb_pending_quote:${businessId}`

interface PendingQuote {
  sourceSummaryMessageId: string
  summary: QuoteSummaryMessageData
  customerName?: string
}

function loadPendingQuote(businessId: string): PendingQuote | null {
  try {
    const stored = sessionStorage.getItem(pendingQuoteStorageKey(businessId))
    return stored ? JSON.parse(stored) as PendingQuote : null
  } catch {
    return null
  }
}

function savePendingQuote(businessId: string, pendingQuote: PendingQuote | null): void {
  if (pendingQuote) {
    sessionStorage.setItem(pendingQuoteStorageKey(businessId), JSON.stringify(pendingQuote))
  } else {
    sessionStorage.removeItem(pendingQuoteStorageKey(businessId))
  }
}

export function useChat(business: Business) {
  const [messages, setMessages] = useState<Message[]>(() => getInitialHistory(business))
  const [awaitingInput, setAwaitingInput] = useState<AwaitingInput | null>(() => loadAwaitingInput(business.id))
  const [isTyping, setIsTyping] = useState(false)
  const [contactName, setContactName] = useState<string>('')
  const responseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingResponseResolverRef = useRef<(() => void) | null>(null)
  const conversationVersionRef = useRef(0)
  const consultationPromiseRef = useRef<Promise<string | null> | null>(null)
  const quoteSubmissionRef = useRef<Set<string>>(new Set(
    messages.flatMap(message => (
      message.generatedQuote ? [message.generatedQuote.sourceSummaryMessageId] : []
    )),
  ))
  const [initialPendingQuote] = useState<PendingQuote | null>(() => loadPendingQuote(business.id))
  const pendingQuoteRef = useRef<PendingQuote | null>(initialPendingQuote)
  const [submittingQuoteMessageId, setSubmittingQuoteMessageId] = useState<string | null>(
    initialPendingQuote?.sourceSummaryMessageId ?? null,
  )

  const ensureConsultation = useCallback((): Promise<string | null> => {
    if (!consultationPromiseRef.current) {
      const storageKey = `emprendebot:consulta:${business.slug}`
      const storedId = sessionStorage.getItem(storageKey)
      const existingConsultationId = storedId ?? business.chatConsultationId
      if (existingConsultationId) sessionStorage.setItem(storageKey, existingConsultationId)
      consultationPromiseRef.current = existingConsultationId
        ? Promise.resolve(existingConsultationId)
        : createPublicConsultation(business.slug, business.chatSessionId ?? crypto.randomUUID())
            .then(async consultationId => {
              sessionStorage.setItem(storageKey, consultationId)
              await savePublicMessage(business.slug, consultationId, 'bot', createInitialMessage(business).text)
              return consultationId
            })
            .catch(() => null)
    }
    return consultationPromiseRef.current
  }, [business])

  const cancelPendingResponse = useCallback(() => {
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current)
      responseTimeoutRef.current = null
    }
    pendingResponseResolverRef.current?.()
    pendingResponseResolverRef.current = null
  }, [])

  useEffect(() => {
    if (!business.chatHasHistory || !business.chatSessionId) return

    const storedMessages = loadChatHistory(business.id)
    if (storedMessages.length > 1) return

    let active = true
    void getPublicHistory(business.slug, business.chatSessionId)
      .then(history => {
        if (!active || history.mensajes.length === 0) return
        const restoredMessages: Message[] = history.mensajes.map((message, index, all) => ({
          id: message.id,
          role: message.emisor === 'CLIENTE' ? 'user' : 'bot',
          text: message.contenido,
          timestamp: new Date(message.fechaCreacion),
          ...(index === all.length - 1 && message.emisor !== 'CLIENTE'
            ? { quickReplies: QUICK_REPLIES_INICIAL }
            : {}),
        }))
        setMessages(restoredMessages)
        saveChatHistory(business.id, restoredMessages)
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [business.chatHasHistory, business.chatSessionId, business.id, business.slug])

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

    const consultationId = await ensureConsultation()
    if (consultationId) {
      await savePublicMessage(business.slug, consultationId, 'cliente', text).catch(() => undefined)
    }

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

    if (awaitingInput === 'quote-contact-name') {
      const name = text.trim()
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/.test(name)) {
        const botMsg: Message = {
          id: crypto.randomUUID(),
          role: 'bot',
          text: 'Necesito un nombre válido usando solamente letras y espacios.',
          timestamp: new Date(),
        }
        setMessages(prev => {
          const next = [...prev, botMsg]
          saveChatHistory(business.id, next)
          return next
        })
        if (consultationId) await savePublicMessage(business.slug, consultationId, 'bot', botMsg.text).catch(() => undefined)
        setIsTyping(false)
        return
      }

      setContactName(name)
      if (pendingQuoteRef.current) {
        pendingQuoteRef.current = { ...pendingQuoteRef.current, customerName: name }
        savePendingQuote(business.id, pendingQuoteRef.current)
      }
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: 'bot',
        text: `Gracias ${name}. ¿Cuál es tu número de teléfono?`,
        timestamp: new Date(),
      }
      setMessages(prev => {
        const next = [...prev, botMsg]
        saveChatHistory(business.id, next)
        return next
      })
      if (consultationId) await savePublicMessage(business.slug, consultationId, 'bot', botMsg.text).catch(() => undefined)
      setAwaitingInput('quote-contact-phone')
      saveAwaitingInput(business.id, 'quote-contact-phone')
      setIsTyping(false)
      return
    }

    if (awaitingInput === 'quote-contact-phone') {
      const phone = text.trim().replace(/[\s-]/g, '')
      const pendingQuote = pendingQuoteRef.current
      const customerName = contactName || pendingQuote?.customerName || ''

      if (!/^\+?[0-9]{8,15}$/.test(phone)) {
        const botMsg: Message = {
          id: crypto.randomUUID(),
          role: 'bot',
          text: 'Ingresá un teléfono válido de entre 8 y 15 números.',
          timestamp: new Date(),
        }
        setMessages(prev => {
          const next = [...prev, botMsg]
          saveChatHistory(business.id, next)
          return next
        })
        if (consultationId) await savePublicMessage(business.slug, consultationId, 'bot', botMsg.text).catch(() => undefined)
        setIsTyping(false)
        return
      }

      try {
        if (!consultationId || !pendingQuote) throw new Error('No hay una solicitud pendiente.')
        await updatePublicContact(
          business.slug,
          consultationId,
          customerName,
          phone,
          'presupuesto',
        )
        const presupuesto = await createPublicBudget(business.slug, consultationId, {
          items: pendingQuote.summary.items.map(item => ({
            productoId: item.productId,
            nombre: item.name,
            cantidad: item.quantity,
            ...(item.unitPrice != null ? { precioUnitario: item.unitPrice } : {}),
            requiereCotizacion: item.requiresQuote,
          })),
          diasValidez: 7,
          idempotencyKey: pendingQuote.sourceSummaryMessageId,
        })
        const confirmationText = 'Tu solicitud de presupuesto fue registrada correctamente.'
        await savePublicMessage(business.slug, consultationId, 'bot', confirmationText)

        const generatedMsg: Message = {
          id: crypto.randomUUID(),
          role: 'bot',
          text: '',
          timestamp: new Date(),
          generatedQuote: {
            requestRegistered: true,
            sourceSummaryMessageId: pendingQuote.sourceSummaryMessageId,
            quoteId: String(presupuesto.id),
            status: presupuesto.estado,
            pdfUrl: presupuesto.linkPdf ?? undefined,
            issuedAt: presupuesto.fechaEmision,
            expiresAt: presupuesto.fechaVencimiento,
            customer: { name: customerName, phone },
            items: pendingQuote.summary.items,
            total: presupuesto.total,
          },
          quickReplies: QUICK_REPLIES_INICIAL,
        }
        setMessages(prev => {
          const next = [...prev, generatedMsg]
          saveChatHistory(business.id, next)
          return next
        })
        setAwaitingInput(null)
        saveAwaitingInput(business.id, null)
        pendingQuoteRef.current = null
        savePendingQuote(business.id, null)
        setContactName('')
      } catch {
        if (pendingQuote) {
          quoteSubmissionRef.current.delete(pendingQuote.sourceSummaryMessageId)
        }
        pendingQuoteRef.current = null
        savePendingQuote(business.id, null)
        setAwaitingInput(null)
        saveAwaitingInput(business.id, null)
        const errorMsg: Message = {
          id: crypto.randomUUID(),
          role: 'bot',
          text: 'No pudimos registrar el cliente y el presupuesto. Intentá nuevamente.',
          timestamp: new Date(),
        }
        setMessages(prev => {
          const next = [...prev, errorMsg]
          saveChatHistory(business.id, next)
          return next
        })
      } finally {
        setSubmittingQuoteMessageId(null)
        setIsTyping(false)
      }
      return
    }

    // Flujo de captura de datos de contacto
    if (awaitingInput === 'contact-name') {
      const name = text.trim() || 'usuario'
      setContactName(name)
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: 'bot',
        text: `¡Gracias ${name}! ¿Cuál es tu número de teléfono?`,
        timestamp: new Date(),
      }
      setMessages(prev => {
        const next = [...prev, botMsg]
        saveChatHistory(business.id, next)
        return next
      })
      if (consultationId) void savePublicMessage(business.slug, consultationId, 'bot', botMsg.text).catch(() => undefined)
      setAwaitingInput('contact-phone')
      saveAwaitingInput(business.id, 'contact-phone')
      setIsTyping(false)
      return
    }

    if (awaitingInput === 'contact-phone') {
      const phone = text.trim()
      if (consultationId) {
        void updatePublicContact(
          business.slug,
          consultationId,
          contactName,
          phone,
          'derivacion',
        ).catch(() => undefined)
      }
      // TODO: POST /api/consultas cuando el backend esté listo
      console.log('Derivación a asesor:', { nombre: contactName, telefono: phone, businessId: business.id })
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: 'bot',
        text: `Perfecto ${contactName}.\nRecibimos tu solicitud de contacto. Una persona del negocio se comunicará con vos a la brevedad. ¡Gracias por contactarte!`,
        timestamp: new Date(),
        quickReplies: QUICK_REPLIES_INICIAL,
      }
      setMessages(prev => {
        const next = [...prev, botMsg]
        saveChatHistory(business.id, next)
        return next
      })
      if (consultationId) void savePublicMessage(business.slug, consultationId, 'bot', botMsg.text).catch(() => undefined)
      setAwaitingInput(null)
      saveAwaitingInput(business.id, null)
      setContactName('')
      setIsTyping(false)
      return
    }

    // Si el usuario hace clic en un chip del menú principal, ignorar el awaitingInput actual
    const isMenuQuickReply = QUICK_REPLIES_INICIAL.some(r => r.toLowerCase() === text.toLowerCase())
    const response = generateBotResponse(text, business, isMenuQuickReply ? null : awaitingInput)
    const botMessages = createBotMessages(response)
    const nextAwaitingInput = response.awaitingInput ?? null

    setMessages(previousMessages => {
      const nextMessages = [...previousMessages, ...botMessages]
      saveChatHistory(business.id, nextMessages)
      return nextMessages
    })
    if (consultationId) {
      botMessages.forEach(message => {
        void savePublicMessage(business.slug, consultationId, 'bot', message.text).catch(() => undefined)
      })
    }
    setAwaitingInput(nextAwaitingInput)
    saveAwaitingInput(business.id, nextAwaitingInput)
    setIsTyping(false)
  }, [awaitingInput, business, contactName, ensureConsultation, isTyping])

  const submitOrder = useCallback((items: OrderItem[]) => {
    if (items.length === 0) return
    const summary = items.map(i => `${i.product.nombre} x${i.quantity}`).join(', ')
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: summary,
      timestamp: new Date(),
    }

    const quoteSummary: QuoteSummaryMessageData = {
      items: items.map(({ product, quantity }) => {
        const requiresQuote = product.precioConsultar === true
        const unitPrice = product.precio
        const hasConfirmedPrice = unitPrice != null && Number.isFinite(unitPrice)
        return {
          productId: product.id,
          name: product.nombre,
          quantity,
          requiresQuote,
          ...(!requiresQuote && hasConfirmedPrice
            ? { unitPrice, subtotal: unitPrice * quantity }
            : {}),
        }
      }),
      subtotal: items.reduce((total, { product, quantity }) => (
        product.precioConsultar !== true && product.precio != null && Number.isFinite(product.precio)
          ? total + product.precio * quantity
          : total
      ), 0),
    }

    const botMsg: Message = {
      id: crypto.randomUUID(),
      role: 'bot',
      text: '',
      timestamp: new Date(),
      quoteSummary,
    }

    setMessages(prev => {
      const next = [...prev, userMsg, botMsg]
      saveChatHistory(business.id, next)
      return next
    })
    void ensureConsultation().then(async consultationId => {
      if (!consultationId) return
      await savePublicMessage(business.slug, consultationId, 'cliente', userMsg.text)
      await savePublicMessage(business.slug, consultationId, 'bot', 'Resumen del pedido listo para confirmar.')
    }).catch(() => undefined)
  }, [business, ensureConsultation])

  const requestQuote = useCallback(async (
    sourceSummaryMessageId: string,
    summary: QuoteSummaryMessageData,
  ) => {
    if (quoteSubmissionRef.current.has(sourceSummaryMessageId)) return
    quoteSubmissionRef.current.add(sourceSummaryMessageId)
    setSubmittingQuoteMessageId(sourceSummaryMessageId)

    try {
      const consultationId = await ensureConsultation()
      if (!consultationId) throw new Error('No se pudo registrar la consulta.')

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        text: 'Solicitar presupuesto',
        timestamp: new Date(),
      }
      await savePublicMessage(business.slug, consultationId, 'cliente', userMsg.text)
      const contactPrompt: Message = {
        id: crypto.randomUUID(),
        role: 'bot',
        text: 'Antes de preparar el presupuesto necesito registrar tus datos. ¿Cuál es tu nombre?',
        timestamp: new Date(),
      }
      await savePublicMessage(business.slug, consultationId, 'bot', contactPrompt.text)

      setMessages(previousMessages => {
        const nextMessages = [...previousMessages, userMsg, contactPrompt]
        saveChatHistory(business.id, nextMessages)
        return nextMessages
      })
      const pendingQuote = { sourceSummaryMessageId, summary }
      pendingQuoteRef.current = pendingQuote
      savePendingQuote(business.id, pendingQuote)
      setAwaitingInput('quote-contact-name')
      saveAwaitingInput(business.id, 'quote-contact-name')
    } catch {
      quoteSubmissionRef.current.delete(sourceSummaryMessageId)
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'bot',
        text: 'No pudimos registrar la solicitud. Podés intentarlo nuevamente.',
        timestamp: new Date(),
      }
      setMessages(previousMessages => {
        const nextMessages = [...previousMessages, errorMessage]
        saveChatHistory(business.id, nextMessages)
        return nextMessages
      })
      setSubmittingQuoteMessageId(null)
    }
  }, [business.id, business.slug, ensureConsultation])

  const reset = useCallback(() => {
    conversationVersionRef.current += 1
    cancelPendingResponse()

    clearChatHistory(business.id)
    clearChatState(business.id)
    sessionStorage.removeItem(`emprendebot:consulta:${business.slug}`)
    consultationPromiseRef.current = null
    quoteSubmissionRef.current.clear()
    pendingQuoteRef.current = null
    savePendingQuote(business.id, null)
    setSubmittingQuoteMessageId(null)
    const initialMessages = [createInitialMessage(business)]
    setMessages(initialMessages)
    setAwaitingInput(null)
    setContactName('')
    saveChatHistory(business.id, initialMessages)
    setIsTyping(false)
  }, [business, cancelPendingResponse])

  return {
    messages,
    isTyping,
    sendMessage,
    submitOrder,
    requestQuote,
    submittingQuoteMessageId,
    reset,
  }
}
