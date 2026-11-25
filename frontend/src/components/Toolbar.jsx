const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

export default function Toolbar({
  filter,
  onFilterChange,
  query,
  onQueryChange,
  counts,
}) {
  return (
    <div className="toolbar">
      <div className="filters" role="group" aria-label="Filter tasks">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={filter === f.id ? 'chip active' : 'chip'}
            onClick={() => onFilterChange(f.id)}
            aria-pressed={filter === f.id}
          >
            {f.label}
            <span className="chip-count">{counts[f.id]}</span>
          </button>
        ))}
      </div>
      <input
        className="search"
        type="search"
        placeholder="Search tasks…"
        aria-label="Search tasks"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
    </div>
  );
}
