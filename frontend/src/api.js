async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const getTodos = () => request('/api/todos');

export const createTodo = ({ title, priority, dueDate }) =>
  request('/api/todos', {
    method: 'POST',
    body: JSON.stringify({ title, priority, dueDate }),
  });

export const updateTodo = (id, patch) =>
  request(`/api/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });

export const deleteTodo = (id) =>
  request(`/api/todos/${id}`, { method: 'DELETE' });

export const clearCompleted = () =>
  request('/api/todos/completed', { method: 'DELETE' });

export const reorderTodos = (orderedIds) =>
  request('/api/todos/reorder', {
    method: 'PATCH',
    body: JSON.stringify({ orderedIds }),
  });
