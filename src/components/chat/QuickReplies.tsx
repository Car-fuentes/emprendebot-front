import { Chip } from '../ui/Chip'

interface QuickRepliesProps {
  options: string[]
  onSelect: (option: string) => void
}

export function QuickReplies({ options, onSelect }: QuickRepliesProps) {
  if (options.length === 0) return null

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      padding: '4px 0 8px',
    }}>
      {options.map(option => (
        <Chip key={option} onClick={() => onSelect(option)}>
          {option}
        </Chip>
      ))}
    </div>
  )
}
