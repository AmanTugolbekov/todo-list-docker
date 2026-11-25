import { useState } from 'react';

function formatDue(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function todayISO() {
  const n = new Date();
  const mm = String(n.getMonth() + 1).padStart(2, '0');
  const dd = String(n.getDate()).padStart(2, '0');
  return `${n.getFullYear()}-${mm}-${dd}`;
}

export default function TodoItem({
  todo,
  onUpdate,
  onDelete,
  onToggle,
  drag,
  dragHandlers,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: todo.title,
    priority: todo.priority,
    dueDate: todo.dueDate || '',
  });
  const [busy, setBusy] = useState(false);

  const overdue =
    Boolean(todo.dueDate) && !todo.completed && todo.dueDate < todayISO();

  function startEdit() {
    setDraft({
      title: todo.title,
      priority: todo.priority,
      dueDate: todo.dueDate || '',
    });
    setEditing(true);
  }

  async function save() {
    const title = draft.title.trim();
    if (!title || busy) return;
    setBusy(true);
    try {
      await onUpdate(todo.id, {
        title,
        priority: draft.priority,
        dueDate: draft.dueDate || null,
      });
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <li className="todo editing">
        <div className="edit-row">
          <input
            className="todo-edit"
            value={draft.title}
            autoFocus
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save();
              if (e.key === 'Escape') setEditing(false);
            }}
            aria-label="Task title"
          />
          <select
            className="prio-select"
            value={draft.priority}
            onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
            aria-label="Priority"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            className="due-input"
            type="date"
            value={draft.dueDate}
            onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
            aria-label="Due date"
          />
          <div className="todo-actions">
            <button type="button" onClick={save} disabled={busy}>
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={busy}
            >
              Cancel
            </button>
          </div>
        </div>
      </li>
    );
  }

  const classNames = ['todo'];
  if (todo.completed) classNames.push('done');
  if (drag.isDragging) classNames.push('dragging');
  if (drag.isOver) classNames.push('drag-over');

  return (
    <li
      className={classNames.join(' ')}
      draggable
      onDragStart={(e) => dragHandlers.onStart(e, todo.id)}
      onDragOver={(e) => dragHandlers.onOver(e, todo.id)}
      onDrop={(e) => dragHandlers.onDrop(e, todo.id)}
      onDragEnd={dragHandlers.onEnd}
    >
      <span className="drag-handle" aria-hidden="true">
        ⠿
      </span>
      <label className="todo-main">
        <input
          type="checkbox"
          checked={todo.completed}
          disabled={busy}
          onChange={() => onToggle(todo)}
        />
        <span
          className={`prio-dot prio-${todo.priority}`}
          title={`${todo.priority} priority`}
        />
        <span className="todo-title">{todo.title}</span>
        {todo.dueDate && (
          <span className={overdue ? 'due overdue' : 'due'}>
            {overdue ? 'Overdue · ' : 'Due '}
            {formatDue(todo.dueDate)}
          </span>
        )}
      </label>
      <div className="todo-actions">
        <button type="button" onClick={startEdit} disabled={busy}>
          Edit
        </button>
        <button
          type="button"
          className="danger"
          onClick={() => onDelete(todo.id)}
          disabled={busy}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
