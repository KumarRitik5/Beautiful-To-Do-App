import React, { useMemo, useRef, useState } from 'react'
import { Download, FileUp, LogOut, Plus, Search, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import TaskItem from './TaskItem.jsx'
import Toast from './Toast.jsx'
import { clampText, downloadJson, isNonEmptyString, makeId, safeJsonParse } from '../lib/storage.js'

const PRIORITY_ORDER = { high: 1, medium: 2, low: 3 }

export default function TaskManager({ session, lists, setLists, listKey, setListKey, onSignOut }) {
  const [filter, setFilter] = useState('all')
  const [sortByPriority, setSortByPriority] = useState(false)
  const [query, setQuery] = useState('')

  const [newText, setNewText] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [newDue, setNewDue] = useState('')

  const [toast, setToast] = useState({ open: false, message: '', actionLabel: '', onAction: null })
  const lastDeletedRef = useRef(null)

  const fileInputRef = useRef(null)

  const tasks = lists?.[listKey] ?? []

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.completed).length
    const active = total - completed
    return { total, active, completed }
  }, [tasks])

  const visibleTasks = useMemo(() => {
    const q = query.trim().toLowerCase()

    let result = tasks

    if (filter === 'active') result = result.filter((t) => !t.completed)
    if (filter === 'completed') result = result.filter((t) => t.completed)

    if (isNonEmptyString(q)) {
      result = result.filter((t) => t.text.toLowerCase().includes(q))
    }

    if (sortByPriority) {
      result = [...result].sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99))
    } else {
      result = [...result].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    }

    return result
  }, [tasks, filter, query, sortByPriority])

  const updateTasks = (updater) => {
    setLists((prev) => {
      const current = prev?.[listKey] ?? []
      const next = updater(current)
      return { ...(prev ?? { private: [], public: [] }), [listKey]: next }
    })
  }

  const addTask = () => {
    const text = clampText(newText.trim(), 180)
    if (!isNonEmptyString(text)) return

    const task = {
      id: makeId(),
      text,
      completed: false,
      priority: newPriority,
      dueDate: newDue ? newDue : null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    updateTasks((current) => [task, ...current])
    setNewText('')
    setNewDue('')
  }

  const toggleTask = (id) => {
    updateTasks((current) =>
      current.map((t) => (t.id === id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t))
    )
  }

  const editTaskText = (id, text) => {
    updateTasks((current) => current.map((t) => (t.id === id ? { ...t, text, updatedAt: Date.now() } : t)))
  }

  const setPriority = (id, priority) => {
    updateTasks((current) =>
      current.map((t) => (t.id === id ? { ...t, priority, updatedAt: Date.now() } : t))
    )
  }

  const deleteTask = (id) => {
    updateTasks((current) => {
      const idx = current.findIndex((t) => t.id === id)
      const task = current[idx]
      if (!task) return current

      lastDeletedRef.current = { listKey, task, index: idx }
      setToast({
        open: true,
        message: 'Task deleted.',
        actionLabel: 'Undo',
        onAction: () => {
          const payload = lastDeletedRef.current
          if (!payload) return
          setLists((prev) => {
            const list = prev?.[payload.listKey] ?? []
            const next = [...list]
            next.splice(payload.index, 0, payload.task)
            return { ...(prev ?? {}), [payload.listKey]: next }
          })
          lastDeletedRef.current = null
          setToast((t) => ({ ...t, open: false }))
        }
      })

      return current.filter((t) => t.id !== id)
    })
  }

  const clearCompleted = () => {
    updateTasks((current) => current.filter((t) => !t.completed))
  }

  const toggleAll = () => {
    const allCompleted = tasks.length > 0 && tasks.every((t) => t.completed)
    updateTasks((current) => current.map((t) => ({ ...t, completed: !allCompleted, updatedAt: Date.now() })))
  }

  const exportList = () => {
    downloadJson(`tasks-${listKey}.json`, { listKey, exportedAt: new Date().toISOString(), tasks })
  }

  const importList = async (file) => {
    const text = await file.text()
    const data = safeJsonParse(text, null)
    const imported = Array.isArray(data?.tasks) ? data.tasks : Array.isArray(data) ? data : null
    if (!imported) {
      setToast({ open: true, message: 'Invalid file. Expected JSON with a tasks array.', actionLabel: '', onAction: null })
      return
    }

    const normalized = imported
      .filter((t) => t && typeof t === 'object')
      .map((t) => ({
        id: typeof t.id === 'string' ? t.id : makeId(),
        text: clampText(String(t.text ?? '').trim(), 180) || 'Untitled task',
        completed: Boolean(t.completed),
        priority: ['high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium',
        dueDate: t.dueDate ? String(t.dueDate) : null,
        createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now(),
        updatedAt: Date.now()
      }))

    setLists((prev) => ({ ...(prev ?? {}), [listKey]: normalized }))
    setToast({ open: true, message: `Imported ${normalized.length} tasks into ${listKey}.`, actionLabel: '', onAction: null })
  }

  return (
    <div className="min-h-screen px-4 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/50 p-6 shadow-soft backdrop-blur sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight">Task Manager</h1>
              </div>
              <p className="mt-1 text-sm text-slate-300">
                {stats.active} active • {stats.completed} done
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {session?.syncStatus === 'saving'
                  ? 'Syncing…'
                  : session?.syncStatus === 'error'
                    ? 'Sync failed (will retry on next change)'
                    : 'Synced'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setListKey('private')}
                  className={clsx(
                    'rounded-xl px-3 py-2 text-sm font-semibold',
                    listKey === 'private' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/5'
                  )}
                >
                  Private
                </button>
                <button
                  type="button"
                  onClick={() => setListKey('public')}
                  className={clsx(
                    'rounded-xl px-3 py-2 text-sm font-semibold',
                    listKey === 'public' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/5'
                  )}
                >
                  Public
                </button>
              </div>

              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-[1fr,160px,170px,auto]">
            <input
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addTask()
              }}
              placeholder="Enter a new task…"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-400/50 focus:ring-4 focus:ring-blue-500/10"
            />

            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none focus:border-blue-400/50 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>

            <input
              type="date"
              value={newDue}
              onChange={(e) => setNewDue(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none focus:border-blue-400/50 focus:ring-4 focus:ring-blue-500/10"
              aria-label="Due date"
            />

            <button
              type="button"
              onClick={addTask}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500"
            >
              <Plus className="size-5" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr,auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks…"
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-400/50 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'active', label: 'Active' },
                  { id: 'completed', label: 'Done' }
                ].map((btn) => (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setFilter(btn.id)}
                    className={clsx(
                      'rounded-xl px-3 py-2 text-sm font-semibold',
                      filter === btn.id ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'
                    )}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSortByPriority((v) => !v)}
                className={clsx(
                  'rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold',
                  sortByPriority ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-200 hover:bg-white/10'
                )}
              >
                Sort by priority
              </button>

              <button
                type="button"
                onClick={toggleAll}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
              >
                Toggle all
              </button>

              <button
                type="button"
                onClick={clearCompleted}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/15"
              >
                <Trash2 className="size-4" /> Clear done
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-300">{visibleTasks.length}</span> visible •{' '}
              <span className="font-semibold text-slate-300">{stats.total}</span> total
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportList}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200 hover:bg-white/10"
              >
                <Download className="size-4" /> Export
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  importList(file)
                  e.target.value = ''
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200 hover:bg-white/10"
              >
                <FileUp className="size-4" /> Import
              </button>
            </div>
          </div>

          <ul className="mt-6 space-y-3">
            {visibleTasks.length === 0 ? (
              <li className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-300">
                No tasks to display.
              </li>
            ) : (
              visibleTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onEditText={editTaskText}
                  onSetPriority={setPriority}
                />
              ))
            )}
          </ul>

        </div>
      </div>

      <Toast
        open={toast.open}
        message={toast.message}
        actionLabel={toast.actionLabel}
        onAction={toast.onAction}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </div>
  )
}
