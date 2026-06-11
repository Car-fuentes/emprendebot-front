import { useEffect, useRef, useState } from "react";
import { sendChatMessage } from "../services/chatService";
import type { ChatMessage } from "../types/chat";

function ChatBox() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [sessionId, setSessionId] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        });
    }, [messages, isLoading]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const message = inputValue.trim();

        if (!message) return;

        const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "user",
        text: message,
        };

        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
        const response = await sendChatMessage(message, sessionId);

        setSessionId(response.sessionId);

        const botMessage: ChatMessage = {
            id: crypto.randomUUID(),
            sender: "bot",
            text: response.respuesta,
        };

        setMessages((prevMessages) => [...prevMessages, botMessage]);
        } catch {
        const errorMessage: ChatMessage = {
            id: crypto.randomUUID(),
            sender: "bot",
            text: "No pude conectarme con el servidor.",
        };

        setMessages((prevMessages) => [...prevMessages, errorMessage]);
        } finally {
        setIsLoading(false);
        }
    }

    return (
        <section className="chat">
        <header className="chat__header">
            <h1>Chatbot Comercial</h1>
            <p>Asistente inicial conectado al backend</p>
        </header>

        <div className="chat__messages">
            {messages.length === 0 && (
            <p className="chat__empty">Escribí un mensaje para iniciar el chat.</p>
            )}

            {messages.map((message) => (
            <div
                key={message.id}
                className={`chat__message chat__message--${message.sender}`}
            >
                {message.text}
            </div>
            ))}

            {isLoading && <p className="chat__loading">El bot está escribiendo...</p>}

            <div ref={messagesEndRef} />
        </div>

        <form className="chat__form" onSubmit={handleSubmit}>
            <input
            type="text"
            placeholder="Escribí tu mensaje..."
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            />

            <button type="submit" disabled={isLoading}>
            Enviar
            </button>
        </form>
        </section>
    );
}

export default ChatBox;