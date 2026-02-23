import React, { useState } from 'react'
import { ListTodo } from 'lucide-react'

export default function AuthScreen({ onLogin, onSignup, isSubmitting, errorMessage }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = async () => {
    if (mode === 'login') {
      await onLogin({ email: email.trim(), password })
      return
    }

    await onSignup({
      name: name.trim(),
      email: email.trim(),
      password
    })
  }

  return (
    <div className="min-h-screen px-4 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/50 p-8 shadow-soft backdrop-blur">
          <div className="text-center">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-fuchsia-500/20">
              <ListTodo className="size-8 text-slate-100" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Task Manager</h1>
          </div>

          <div className="mt-8 mb-4 flex rounded-2xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${
                mode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${
                mode === 'signup' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              Sign up
            </button>
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            {mode === 'signup' ? (
              <div>
                <label className="text-sm font-medium text-slate-200">Your name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ritik"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-400/50 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            ) : null}

            <div>
              <label className="text-sm font-medium text-slate-200">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-400/50 focus:ring-4 focus:ring-blue-500/10"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="At least 6 characters"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-400/50 focus:ring-4 focus:ring-blue-500/10"
                required
              />
            </div>

            {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

            <button
              type="button"
              onClick={submit}
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-indigo-500"
            >
              {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
