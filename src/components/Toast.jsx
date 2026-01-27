import React, { useEffect } from 'react'

export default function Toast({ open, message, actionLabel, onAction, onClose, durationMs = 5000 }) {
  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => onClose?.(), durationMs)
    return () => window.clearTimeout(timer)
  }, [open, onClose, durationMs])

  if (!open) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[min(520px,calc(100vw-2rem))] -translate-x-1/2">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-slate-100 shadow-soft backdrop-blur">
        <div className="text-sm text-slate-200">{message}</div>
        <div className="flex items-center gap-2">
          {actionLabel ? (
            <button
              type="button"
              onClick={onAction}
              className="rounded-xl bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/15"
            >
              {actionLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
