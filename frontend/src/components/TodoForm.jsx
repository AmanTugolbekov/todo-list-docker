import { useState } from 'react';

const PRIORITIES = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
];

export default function TodoForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await onSubmit({ title: trimmed, priority, dueDate: dueDate || null });
      setTitle('');
      setDueDate('');
      setPriority('medium');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          aria-label="Task title"
        />
        <button type="submit" disabled={busy || !title.trim()}>
          Add
        </button>
      </div>
      <div className="form-options">
        <div className="prio-group" role="group" aria-label="Priority">
          {PRIORITIES.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`prio-chip prio-${p.id}${priority === p.id ? ' selected' : ''}`}
              onClick={() => setPriority(p.id)}
              aria-pressed={priority === p.id}
            >
              {p.label}
            </button>
          ))}
        </div>
        <label className="due-field">
          <span>Due</span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="Due date"
          />
        </label>
      </div>
    </form>
  );
}
