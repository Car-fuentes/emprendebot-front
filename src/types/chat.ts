export type ChatOrigen = "web" | "mobile" | "api";

export type ChatRequestDto = {
    sessionId?: string;
    message: string;
    origen: ChatOrigen;
    timestamp: string;
};

export type ChatResponseDto = {
    sessionId: string;
    respuesta: string;
};

export type ChatMessage = {
    id: string;
    sender: "user" | "bot";
    text: string;
};