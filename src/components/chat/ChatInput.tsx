import { useState, type FormEvent, type KeyboardEvent } from 'react'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const text = value.trim()
      if (!text || disabled) return
      onSend(text)
      setValue('')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        background: 'var(--color-bg)',
        borderTop: '1px solid var(--color-border)',
        flexShrink: 0,
      }}
    >
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Escribí tu mensaje..."
        style={{
          flex: 1,
          height: '44px',
          padding: '0 14px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--color-border)',
          fontSize: '14px',
          fontFamily: 'var(--font-family)',
          color: 'var(--color-text-primary)',
          background: disabled ? 'var(--color-bg-subtle)' : 'var(--color-bg)',
          outline: 'none',
        }}
      />
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        style={{
          width: 44, height: 44,
          borderRadius: '50%',
          background: 'var(--color-secondary)',
          border: 'none',
          color: '#fff',
          cursor: value.trim() && !disabled ? 'pointer' : 'not-allowed',
          opacity: value.trim() && !disabled ? 1 : 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          flexShrink: 0,
          transition: 'opacity var(--transition)',
        }}
      >
        ➤
      </button>
    </form>
  )
}
