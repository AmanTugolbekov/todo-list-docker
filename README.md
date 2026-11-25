# Todo List (Docker)

A to-do list website: React + Vite on the front end, Node.js/Express API on the back end,
PostgreSQL as the database. Everything runs with a single command via Docker Compose —
three containers: `frontend` (Nginx), `backend`, `db`.

The UI is styled in an iPhone "Liquid Glass" look: frosted translucent layers, floating
color blobs and the Inter typeface.

## Features

- Add, edit, complete and delete tasks
- **Priorities** — Low / Medium / High with colored indicators
- **Due dates** with overdue highlighting
- **Filters** — All / Active / Completed, plus "Clear completed"
- **Search** across task titles
- **Progress bar** for completed tasks
- **Drag & drop** reordering (persisted to the database)
- **Dark mode** toggle (remembered between visits)
- Liquid Glass UI with the Inter typeface

## Getting started

```bash
docker compose up --build
```

Open http://localhost:8081

Stop: `docker compose down` (data is kept in the `pgdata` volume).
Full cleanup including data: `docker compose down -v`.

> The frontend port is configurable via `APP_PORT` in `.env` (8081 is the default
> in this setup; port 8080 was already taken on the host).

## Configuration

Optional: copy `.env.example` to `.env` and change the values
(`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `APP_PORT`).

## Structure

```
├── docker-compose.yml
├── backend/            # Express API (port 3000 inside the Docker network)
│   ├── Dockerfile
│   └── src/
│       ├── index.js    # server + database wait loop
│       ├── db.js       # pg connection pool
│       ├── init.sql    # todos table schema
│       └── routes/todos.js
└── frontend/           # React + Vite, built to static files served by Nginx
    ├── Dockerfile      # multi-stage build
    ├── nginx.conf      # static files + /api proxy to backend
    └── src/
```

## API

| Method | Path                  | Description                                     |
|--------|-----------------------|-------------------------------------------------|
| GET    | /api/todos            | list all tasks                                  |
| POST   | /api/todos            | create `{ title, priority?, dueDate? }`         |
| PATCH  | /api/todos/:id        | update `{ title?, completed?, priority?, dueDate? }` |
| DELETE | /api/todos/:id        | delete                                          |
| PATCH  | /api/todos/reorder    | persist drag & drop order `{ orderedIds: [] }`  |
| DELETE | /api/todos/completed  | clear all completed tasks                       |
| GET    | /health               | service healthcheck                             |

`priority` is `low` | `medium` | `high`; `dueDate` is `YYYY-MM-DD` or `null`.

The backend runs idempotent `ALTER TABLE` migrations on startup, so an existing
database is upgraded automatically.

## Local development (without Docker for the app itself)

1. Start only the database: `docker compose up db`
2. Backend: `cd backend && npm install && npm start`
3. Frontend: `cd frontend && npm install && npm run dev` → http://localhost:5173
   (proxies `/api` to :3000)

## Security notes

- `.env` is git-ignored; only `.env.example` (placeholder values) is committed.
- PostgreSQL credentials default to `postgres/postgres` for local development —
  change them via `.env` for anything beyond a local machine. The database port
  is not published to the host; it is only reachable inside the Docker network.
