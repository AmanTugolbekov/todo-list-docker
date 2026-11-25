import { useState } from 'react';

export default function TodoItem({ todo, onToggle, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const [busy, setBusy] = useState(false);

  async function save() {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(todo.title);
      setEditing(false);
      return;
    }
    setBusy(true);
    try {
      await onRename(todo.id, trimmed);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className={todo.completed ? 'todo done' : 'todo'}>
      <label className="todo-main">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo)}
          disabled={busy}
        />
        {editing ? (
          <input
            type="text"
            className="todo-edit"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save();
              if (e.key === 'Escape') {
                setDraft(todo.title);
                setEditing(false);
              }
            }}
            autoFocus
          />
        ) : (
          <span className="todo-title">{todo.title}</span>
        )}
      </label>
      <div className="todo-actions">
        {editing ? (
          <>
            <button onClick={save} disabled={busy}>Сохранить</button>
            <button
              onClick={() => {
                setDraft(todo.title);
                setEditing(false);
              }}
            >
              Отмена
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} disabled={busy}>
              Изменить
            </button>
            <button
              className="danger"
              onClick={() => onDelete(todo.id)}
              disabled={busy}
            >
              Удалить
            </button>
          </>
        )}
      </div>
    </li>
  );
}
