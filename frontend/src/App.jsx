import { useEffect, useMemo, useState } from 'react';
import TodoForm from './components/TodoForm.jsx';
import TodoList from './components/TodoList.jsx';
import Toolbar from './components/Toolbar.jsx';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  clearCompleted,
  reorderTodos,
} from './api.js';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Run an async handler and surface its error in the UI
  const safe = (fn) => async (...args) => {
    try {
      await fn(...args);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = safe(async ({ title, priority, dueDate }) => {
    const created = await createTodo({ title, priority, dueDate });
    setTodos((prev) => [created, ...prev]);
  });

  const handleToggle = safe(async (todo) => {
    const updated = await updateTodo(todo.id, { completed: !todo.completed });
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  });

  const handleUpdate = safe(async (id, patch) => {
    const updated = await updateTodo(id, patch);
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  });

  const handleDelete = safe(async (id) => {
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  });

  const handleClearCompleted = safe(async () => {
    await clearCompleted();
    setTodos((prev) => prev.filter((t) => !t.completed));
  });

  const handleReorder = safe(async (dragId, targetId) => {
    const ids = todos.map((t) => t.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0 || from === to) return;
    const next = [...ids];
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    const fresh = await reorderTodos(next);
    setTodos(fresh);
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.length - activeCount;
  const percent = todos.length
    ? Math.round((completedCount / todos.length) * 100)
    : 0;

  const counts = {
    all: todos.length,
    active: activeCount,
    completed: completedCount,
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return todos.filter((t) => {
      if (filter === 'active' && t.completed) return false;
      if (filter === 'completed' && !t.completed) return false;
      if (q && !t.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [todos, filter, query]);

  const emptyMessage = query.trim()
    ? `No tasks match “${query.trim()}”`
    : filter === 'active'
      ? "Nothing active — you're all caught up!"
      : filter === 'completed'
        ? 'No completed tasks yet.'
        : 'No tasks yet — add your first one!';

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <h1>Todo List</h1>
          <p className="subtitle">Your day, beautifully organized.</p>
        </div>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle dark mode"
          title="Toggle dark mode"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      <TodoForm onSubmit={handleCreate} />

      <Toolbar
        filter={filter}
        onFilterChange={setFilter}
        query={query}
        onQueryChange={setQuery}
        counts={counts}
      />

      <div
        className="progress"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Completed tasks"
      >
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>

      {error && <p className="error">Error: {error}</p>}

      {loading ? (
        <p className="empty">Loading…</p>
      ) : (
        <TodoList
          todos={visible}
          emptyMessage={emptyMessage}
          onToggle={handleToggle}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onReorder={handleReorder}
        />
      )}

      <footer className="app-footer">
        <p className="counter">
          {activeCount} of {todos.length} tasks active
        </p>
        {completedCount > 0 && (
          <button
            type="button"
            className="clear-completed"
            onClick={handleClearCompleted}
          >
            Clear completed ({completedCount})
          </button>
        )}
      </footer>
    </main>
  );
}
