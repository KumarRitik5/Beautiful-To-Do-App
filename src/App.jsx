import React from 'react'
import AuthScreen from './components/AuthScreen.jsx'
import TaskManager from './components/TaskManager.jsx'
import { useLocalStorageState } from './lib/useLocalStorageState.js'

export default function App() {
  const [session, setSession] = useLocalStorageState('todo:session:v1', null)
  const [lists, setLists] = useLocalStorageState('todo:lists:v1', () => ({ private: [], public: [] }))
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
