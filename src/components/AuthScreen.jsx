import React, { useState } from 'react'

export default function AuthScreen({ onContinueOffline }) {
  const [name, setName] = useState('')

  return (
    <div className="min-h-screen px-4 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/50 p-8 shadow-soft backdrop-blur">
          <div className="text-center">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-fuchsia-500/20">
              <span className="text-3xl">📋</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Task Manager</h1>
          </div>

          <div className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-200">Your name (optional)</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ritik"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-400/50 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <button
              type="button"
              onClick={() => onContinueOffline({ name: name.trim() })}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-indigo-500"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
