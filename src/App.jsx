import React from 'react'
import AuthScreen from './components/AuthScreen.jsx'
import TaskManager from './components/TaskManager.jsx'
import { useLocalStorageState } from './lib/useLocalStorageState.js'

function seedTasks() {
  const now = Date.now()
  const make = (id, text, completed, priority, offset) => ({
    id,
    text,
    completed,
    priority,
    createdAt: now + offset,
    updatedAt: now + offset
  })

  // deterministic-ish ids so refresh doesn't create duplicates before first save
  return [
    make('seed-1', '👋 Welcome to Task Manager!', false, 'high', 1),
    make('seed-2', '✨ Add tasks using the input above', false, 'medium', 2),
    make('seed-3', '🔄 Everything auto-saves offline', false, 'low', 3),
    make('seed-4', '✅ Click the check to complete', true, 'medium', 4),
    make('seed-5', '📝 Double click text to edit', false, 'low', 5)
  ]
}

export default function App() {
  const [session, setSession] = useLocalStorageState('todo:session:v1', null)
  const [lists, setLists] = useLocalStorageState('todo:lists:v1', () => ({ private: seedTasks(), public: [] }))
  const [listKey, setListKey] = useLocalStorageState('todo:listKey:v1', 'private')

  if (!session) {
    return (
      <AuthScreen
        onContinueOffline={({ name }) => {
          setSession({ mode: 'offline', name: name || null, signedInAt: Date.now() })
        }}
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
      onSignOut={() => setSession(null)}
    />
  )
}
