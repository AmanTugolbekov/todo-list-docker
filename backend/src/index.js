const express = require('express');
const pool = require('./db');
const todosRouter = require('./routes/todos');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/todos', todosRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

// Wait for the database to be ready before starting, so Docker Compose
// does not restart the container in vain
async function start() {
  for (let attempt = 1; attempt <= 30; attempt++) {
    try {
      await pool.query('SELECT 1');
      break;
    } catch (err) {
      console.log(`Waiting for database... (${attempt}/30)`);
      await new Promise((r) => setTimeout(r, 2000));
      if (attempt === 30) throw err;
    }
  }

  app.listen(PORT, () => {
    console.log(`API listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
