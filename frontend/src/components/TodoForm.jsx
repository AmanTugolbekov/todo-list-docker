import { useState } from 'react';

export default function TodoForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await onSubmit(trimmed);
      setTitle('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Что нужно сделать?"
        aria-label="Название задачи"
      />
      <button type="submit" disabled={busy || !title.trim()}>
        Добавить
      </button>
    </form>
  );
}
