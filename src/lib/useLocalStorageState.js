import { useEffect, useState } from 'react'
import { safeJsonParse } from './storage.js'

export function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    const fromStorage = safeJsonParse(localStorage.getItem(key), undefined)
    if (fromStorage !== undefined) return fromStorage
    return typeof initialValue === 'function' ? initialValue() : initialValue
  })

  // If the key changes, re-hydrate from the new key.
  useEffect(() => {
    const fromStorage = safeJsonParse(localStorage.getItem(key), undefined)
    if (fromStorage !== undefined) setState(fromStorage)
  }, [key])

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  return [state, setState]
}
