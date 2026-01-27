import React, { useMemo, useState } from 'react'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import { clampText, isNonEmptyString } from '../lib/storage.js'
import clsx from 'clsx'

const PRIORITY_META = {
  high: { label: 'High', dot: 'bg-red-500' },
  medium: { label: 'Medium', dot: 'bg-amber-500' },
  low: { label: 'Low', dot: 'bg-emerald-500' }
}

export default function TaskItem({ task, onToggle, onDelete, onEditText, onSetPriority }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(task.text)

  const priority = PRIORITY_META[task.priority] ?? PRIORITY_META.medium

  const dueLabel = useMemo(() => {
    if (!task.dueDate) return null
    const d = new Date(task.dueDate)
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }, [task.dueDate])

  const save = () => {
    const next = clampText(draft.trim(), 180)
    if (isNonEmptyString(next) && next !== task.text) onEditText(task.id, next)
    setIsEditing(false)
  }

  return (
    <li
      className={clsx(
        'group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/7',
        task.completed && 'opacity-80'
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className={clsx('size-3 shrink-0 rounded-full', priority.dot)} title={priority.label} />

        <button
          type="button"
          onClick={() => onToggle(task.id)}
          className={clsx(
            'grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
            task.completed && 'bg-emerald-500/15 text-emerald-200'
          )}
          aria-label={task.completed ? 'Mark as not completed' : 'Mark as completed'}
        >
          <Check className={clsx('size-5', !task.completed && 'opacity-40')} />
        </button>

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') save()
                  if (e.key === 'Escape') {
                    setIsEditing(false)
                    setDraft(task.text)
                  }
                }}
                onBlur={save}
                className="w-full rounded-xl border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-400/50 focus:ring-4 focus:ring-blue-500/10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setDraft(task.text)
                }}
                className="grid size-9 place-items-center rounded-xl hover:bg-white/5"
                aria-label="Cancel"
              >
                <X className="size-5 text-slate-300" />
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span
                onDoubleClick={() => {
                  setIsEditing(true)
                  setDraft(task.text)
                }}
                className={clsx(
                  'min-w-0 cursor-text select-none break-words text-sm font-medium',
                  task.completed ? 'text-slate-400 line-through' : 'text-slate-100'
                )}
                title="Double click to edit"
              >
                {task.text}
              </span>
              {dueLabel ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-300">
                  Due {dueLabel}
                </span>
              ) : null}
            </div>
          )}

          <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
            <button
              type="button"
              onClick={() => onSetPriority(task.id, 'high')}
              className={clsx('rounded-full px-2 py-0.5 hover:bg-white/5', task.priority === 'high' && 'text-red-300')}
            >
              High
            </button>
            <button
              type="button"
              onClick={() => onSetPriority(task.id, 'medium')}
              className={clsx('rounded-full px-2 py-0.5 hover:bg-white/5', task.priority === 'medium' && 'text-amber-200')}
            >
              Med
            </button>
            <button
              type="button"
              onClick={() => onSetPriority(task.id, 'low')}
              className={clsx('rounded-full px-2 py-0.5 hover:bg-white/5', task.priority === 'low' && 'text-emerald-200')}
            >
              Low
            </button>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
        <button
          type="button"
          onClick={() => {
            setIsEditing(true)
            setDraft(task.text)
          }}
          className="grid size-9 place-items-center rounded-xl hover:bg-white/5"
          aria-label="Edit"
        >
          <Pencil className="size-5 text-slate-300" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="grid size-9 place-items-center rounded-xl hover:bg-red-500/10"
          aria-label="Delete"
        >
          <Trash2 className="size-5 text-red-300" />
        </button>
      </div>
    </li>
  )
}
