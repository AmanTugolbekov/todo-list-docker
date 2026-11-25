# Todo List (Docker)

Сайт-список задач: React + Vite на фронте, Node.js/Express API на бэке, PostgreSQL в качестве базы.
Всё запускается одной командой через Docker Compose — три контейнера: `frontend` (Nginx), `backend`, `db`.

## Запуск

```bash
docker compose up --build
```

Откройте http://localhost:8080

Стоп: `docker compose down` (данные БД сохранятся в volume `pgdata`).
Полная очистка с данными: `docker compose down -v`.

## Настройка

Необязательно: скопируйте `.env.example` в `.env` и поменяйте значения
(`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `APP_PORT`).

## Структура

```
├── docker-compose.yml
├── backend/            # Express API (порт 3000 внутри сети)
│   ├── Dockerfile
│   └── src/
│       ├── index.js    # сервер + ожидание БД
│       ├── db.js       # пул pg
│       ├── init.sql    # схема таблицы todos
│       └── routes/todos.js
└── frontend/           # React + Vite, сборка -> Nginx
    ├── Dockerfile      # многостадийная сборка
    ├── nginx.conf      # статика + прокси /api на backend
    └── src/
```

## API

| Метод  | Путь            | Описание                          |
|--------|-----------------|-----------------------------------|
| GET    | /api/todos      | список задач                      |
| POST   | /api/todos      | создать `{ "title": "..." }`      |
| PATCH  | /api/todos/:id  | обновить `{ title?, completed? }` |
| DELETE | /api/todos/:id  | удалить                           |
| GET    | /health         | healthcheck сервиса               |

## Локальная разработка (без Docker для фронта/бэка)

1. Поднять только БД: `docker compose up db`
2. Бэкенд: `cd backend && npm install && npm start`
3. Фронтенд: `cd frontend && npm install && npm run dev` → http://localhost:5173 (проксирует `/api` на :3000)
