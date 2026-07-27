import type { ChatRequestDto, ChatResponseDto } from '../types/chat'
import { apiRequest } from './apiClient'

export async function sendChatMessage(
  message: string,
  sessionId?: string,
): Promise<ChatResponseDto> {
  const body: ChatRequestDto = {
    sessionId,
    message,
    origen: 'web',
    timestamp: new Date().toISOString(),
  }

  return apiRequest<ChatResponseDto>('/chatbot/chat', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(body),
  })
}
