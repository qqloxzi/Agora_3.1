import { Coins } from 'lucide-react'

export function TokenBadge({ tokens = 0, size = 'md', className = '' }) {
  const sizes = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  }
  return (
    <div
      className={`inline-flex items-center rounded-full bg-token/15 text-token font-bold border border-token/30 ${sizes[size]} ${className}`}
    >
      <Coins size={size === 'lg' ? 18 : size === 'sm' ? 13 : 15} className="fill-token/40" />
      {tokens.toLocaleString('tr-TR')}
    </div>
  )
}
