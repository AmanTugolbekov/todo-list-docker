import TodoItem from './TodoItem.jsx';

export default function TodoList({ todos, onToggle, onRename, onDelete }) {
  if (todos.length === 0) {
    return <p className="empty">Задач пока нет — добавьте первую!</p>;
  }
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
