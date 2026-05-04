import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  children: ReactNode
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  confirmDanger?: boolean
}

export function Modal({ title, children, onConfirm, onCancel, confirmLabel = 'Confirmar', confirmDanger = false }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 dark:bg-black/50"
        onClick={onCancel}
      />

      {/* Panel */}
      <div className="relative bg-white dark:bg-green-950 rounded-2xl border border-green-100 dark:border-green-800 w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
        <h2 className="text-base font-bold dark:text-green-50">{title}</h2>
        <div className="text-sm text-gray-500 dark:text-green-400">{children}</div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-green-200 dark:border-green-700 text-sm font-medium dark:text-green-200 hover:bg-green-50 dark:hover:bg-green-900"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2 rounded-xl text-sm font-medium text-white ${
              confirmDanger
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

    </div>
  )
}
