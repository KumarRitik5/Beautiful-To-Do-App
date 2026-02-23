import React, { useEffect, useMemo, useRef, useState } from 'react'
import AuthScreen from './components/AuthScreen.jsx'
import TaskManager from './components/TaskManager.jsx'
import { getLists, getSession, login, logout, saveLists, signup } from './lib/api.js'

export default function App() {
  const [session, setSession] = useState(null)
  const [lists, setLists] = useState({ private: [], public: [] })
  const [listKey, setListKey] = useState('private')
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false)
  const [authError, setAuthError] = useState('')

  const didLoadListsRef = useRef(false)
  const saveTimerRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const user = await getSession()
        if (cancelled) return

        if (!user) {
          setSession(null)
          setIsBootstrapping(false)
          return
        }

        setSession({ ...user, syncStatus: 'synced' })

        const cloudLists = await getLists()
        if (cancelled) return

        setLists(cloudLists)
        didLoadListsRef.current = true
      } catch {
        if (!cancelled) {
          setSession(null)
        }
      } finally {
        if (!cancelled) setIsBootstrapping(false)
      }
    }

    bootstrap()

    return () => {
      cancelled = true
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!session || !didLoadListsRef.current) return

    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)

    setSession((prev) => (prev ? { ...prev, syncStatus: 'saving' } : prev))

    saveTimerRef.current = window.setTimeout(async () => {
      try {
        await saveLists(lists)
        setSession((prev) => (prev ? { ...prev, syncStatus: 'synced' } : prev))
      } catch {
        setSession((prev) => (prev ? { ...prev, syncStatus: 'error' } : prev))
      }
    }, 500)
  }, [lists, session])

  const canRenderTaskManager = useMemo(() => !isBootstrapping && Boolean(session), [isBootstrapping, session])

  const handleLogin = async ({ email, password }) => {
    setIsSubmittingAuth(true)
    setAuthError('')
    try {
      const user = await login({ email, password })
      const cloudLists = await getLists()
      setLists(cloudLists)
      didLoadListsRef.current = true
      setSession({ ...user, syncStatus: 'synced' })
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Failed to login.')
    } finally {
      setIsSubmittingAuth(false)
    }
  }

  const handleSignup = async ({ name, email, password }) => {
    setIsSubmittingAuth(true)
    setAuthError('')
    try {
      const user = await signup({ name, email, password })
      const cloudLists = await getLists()
      setLists(cloudLists)
      didLoadListsRef.current = true
      setSession({ ...user, syncStatus: 'synced' })
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Failed to create account.')
    } finally {
      setIsSubmittingAuth(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await logout()
    } finally {
      setSession(null)
      setLists({ private: [], public: [] })
      didLoadListsRef.current = false
    }
  }

  if (isBootstrapping) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-200">
        <p className="text-sm">Loading…</p>
      </div>
    )
  }

  if (!canRenderTaskManager) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        onSignup={handleSignup}
        isSubmitting={isSubmittingAuth}
        errorMessage={authError}
      />
    )
  }

  return (
    <TaskManager
      session={session}
      lists={lists}
      setLists={setLists}
      listKey={listKey === 'public' ? 'public' : 'private'}
      setListKey={(next) => setListKey(next === 'public' ? 'public' : 'private')}
      onSignOut={handleSignOut}
    />
  )
}
