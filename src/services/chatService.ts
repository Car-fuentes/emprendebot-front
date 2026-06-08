import type { ChatRequestDto, ChatResponseDto } from "../types/chat"

const API_URL = "http://localhost:3000/chat";

export async function sendChatMessage(
    message: string,
    sessionId?: string
    ): Promise<ChatResponseDto> {
    const body: ChatRequestDto = {
        sessionId,
        message,
        origen: "web",
        timestamp: new Date().toISOString(),
    };

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error("Error al comunicarse con el servidor");
    }

    return response.json();
}