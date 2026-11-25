import { useEffect, useState } from 'react';
import TodoForm from './components/TodoForm.jsx';
import TodoList from './components/TodoList.jsx';
import { getTodos, createTodo, updateTodo, deleteTodo } from './api.js';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(title) {
    const created = await createTodo(title);
    setTodos((prev) => [created, ...prev]);
  }

  async function handleToggle(todo) {
    const updated = await updateTodo(todo.id, { completed: !todo.completed });
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  async function handleRename(id, title) {
    const updated = await updateTodo(id, { title });
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  async function handleDelete(id) {
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  const active = todos.filter((t) => !t.completed).length;

  return (
    <main className="app">
      <header>
        <h1>Todo List</h1>
        <p className="subtitle">Your day, beautifully organized.</p>
      </header>
      <TodoForm onSubmit={handleCreate} />
      {error && <p className="error">Error: {error}</p>}
      {loading ? (
        <p className="empty">Loading…</p>
      ) : (
        <>
          <TodoList
            todos={todos}
            onToggle={handleToggle}
            onRename={handleRename}
            onDelete={handleDelete}
          />
          <p className="counter">
            {active} of {todos.length} tasks active
          </p>
        </>
      )}
    </main>
  );
}
