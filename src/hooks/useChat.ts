import { useState, useCallback, useEffect } from 'react'
import type { Message, Business } from '../types'

const QUICK_REPLIES_INICIAL = [
  'Consultar productos',
  'Solicitar información',
  'Generar presupuesto',
  'Dejar mis datos',
  'Preguntas frecuentes',
  'Hablar con una persona',
]

function generateBotResponse(userMessage: string, business: Business): { text: string; quickReplies?: string[] } {
  const msg = userMessage.toLowerCase()

  if (msg.includes('producto') || msg.includes('catálogo') || msg.includes('catalogo')) {
    if (business.productos.length === 0) {
      return { text: 'Todavía no tenemos productos cargados. ¿Te puedo ayudar con algo más?' }
    }
    const lista = business.productos.map(p =>
      `• ${p.nombre}${p.precio ? ` - $${p.precio}` : ''}${p.descripcion ? `\n  ${p.descripcion}` : ''}`
    ).join('\n')
    return { text: `Nuestros productos disponibles:\n\n${lista}\n\n¿Querés más información sobre alguno?` }
  }

  if (msg.includes('horario') || msg.includes('información') || msg.includes('informacion')) {
    return {
      text: `📋 *Información de ${business.nombre}*\n\n🕐 Horario: ${business.horario || 'No especificado'}\n📞 Teléfono: ${business.telefono || 'No especificado'}\n\n${business.descripcion || ''}`,
    }
  }

  if (msg.includes('presupuesto')) {
    return {
      text: '¡Perfecto! Para armar un presupuesto necesito algunos datos. ¿Podés contarme qué productos o servicios te interesan?',
    }
  }

  if (msg.includes('datos') || msg.includes('contacto')) {
    return {
      text: 'Para dejarte tus datos necesito:\n\n• Tu nombre completo\n• Tu email o teléfono\n\n¿Podés compartirlos?',
    }
  }

  if (msg.includes('frecuente') || msg.includes('faq') || msg.includes('pregunta')) {
    if (business.faq.length === 0) {
      return { text: 'No hay preguntas frecuentes configuradas aún. ¿Puedo ayudarte con otra cosa?' }
    }
    const texto = business.faq.map(f => `❓ ${f.pregunta}\n💬 ${f.respuesta}`).join('\n\n')
    return { text: texto }
  }

  if (msg.includes('persona') || msg.includes('asesor') || msg.includes('hablar')) {
    return { text: business.respuestaDerivacion || 'Te voy a conectar con un asesor en breve. ¡Gracias por tu paciencia!' }
  }

  return {
    text: `Entendido. Estoy aquí para ayudarte con información sobre ${business.nombre}. ¿Qué necesitás?`,
    quickReplies: QUICK_REPLIES_INICIAL,
  }
}

export function useChat(business: Business | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!business) return
    setMessages([{
      id: crypto.randomUUID(),
      role: 'bot',
      text: business.mensajeBienvenida || `¡Hola! Soy el asistente virtual de ${business.nombre}. ¿En qué te puedo ayudar?`,
      timestamp: new Date(),
      quickReplies: QUICK_REPLIES_INICIAL,
    }])
  }, [business?.id])

  const sendMessage = useCallback(async (text: string) => {
    if (!business) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    // Simula delay de respuesta
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600))

    const response = generateBotResponse(text, business)
    const botMsg: Message = {
      id: crypto.randomUUID(),
      role: 'bot',
      text: response.text,
      timestamp: new Date(),
      quickReplies: response.quickReplies,
    }

    setMessages(prev => [...prev, botMsg])
    setIsTyping(false)
  }, [business])

  const reset = useCallback(() => {
    if (!business) return
    setMessages([{
      id: crypto.randomUUID(),
      role: 'bot',
      text: business.mensajeBienvenida || `¡Hola! Soy el asistente virtual de ${business.nombre}. ¿En qué te puedo ayudar?`,
      timestamp: new Date(),
      quickReplies: QUICK_REPLIES_INICIAL,
    }])
  }, [business])

  return { messages, isTyping, sendMessage, reset }
}
