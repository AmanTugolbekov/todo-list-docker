import { useState } from 'react';
import TodoItem from './TodoItem.jsx';

export default function TodoList({
  todos,
  emptyMessage,
  onToggle,
  onUpdate,
  onDelete,
  onReorder,
}) {
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);

  if (todos.length === 0) {
    return <p className="empty">{emptyMessage}</p>;
  }

  const dragHandlers = {
    onStart: (e, id) => {
      setDragId(id);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(id));
    },
    onOver: (e, id) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (id !== dragId) setOverId(id);
    },
    onDrop: (e, id) => {
      e.preventDefault();
      const from = dragId;
      setDragId(null);
      setOverId(null);
      if (from !== null && from !== id) onReorder(from, id);
    },
    onEnd: () => {
      setDragId(null);
      setOverId(null);
    },
  };

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
          drag={{ isDragging: dragId === todo.id, isOver: overId === todo.id }}
          dragHandlers={dragHandlers}
        />
      ))}
    </ul>
  );
}
