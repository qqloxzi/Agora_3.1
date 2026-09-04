import { X } from 'lucide-react'

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-3xl bg-ice-white dark:bg-ink border border-primary-blue/10 dark:border-white/10 shadow-2xl p-6 md:p-8 animate-pop-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-extrabold text-ink dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full text-ink/40 hover:bg-ink/5 dark:hover:bg-white/10">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
