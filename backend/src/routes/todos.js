const express = require('express');
const pool = require('../db');

const router = express.Router();

const PRIORITIES = ['low', 'medium', 'high'];
const COLUMNS = `id, title, completed, priority,
  to_char(due_date, 'YYYY-MM-DD') AS "dueDate", position, created_at`;
const ORDER_BY = 'ORDER BY position ASC, id DESC';

function listTodos() {
  return pool.query(`SELECT ${COLUMNS} FROM todos ${ORDER_BY}`).then((r) => r.rows);
}

// Accepts null / '' / 'YYYY-MM-DD'; returns { value } or { error }
function parseDueDate(value) {
  if (value === null || value === undefined || value === '') return { value: null };
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { value };
  }
  return { error: 'dueDate must be a date string (YYYY-MM-DD) or null' };
}

// GET /api/todos — list all tasks
router.get('/', async (req, res, next) => {
  try {
    res.json(await listTodos());
  } catch (err) {
    next(err);
  }
});

// POST /api/todos — create a task
router.post('/', async (req, res, next) => {
  try {
    const { title, priority = 'medium', dueDate = null } = req.body;
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'title is required' });
    }
    if (!PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: 'priority must be low, medium or high' });
    }
    const due = parseDueDate(dueDate);
    if (due.error) return res.status(400).json({ error: due.error });

    const result = await pool.query(
      `INSERT INTO todos (title, priority, due_date, position)
       VALUES ($1, $2, $3, (SELECT COALESCE(MIN(position), 0) - 1 FROM todos))
       RETURNING ${COLUMNS}`,
      [title.trim(), priority, due.value]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/todos/reorder — persist drag & drop order (must precede /:id)
router.patch('/reorder', async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.some((id) => !Number.isInteger(id))) {
      return res.status(400).json({ error: 'orderedIds must be an array of integers' });
    }
    if (new Set(orderedIds).size !== orderedIds.length) {
      return res.status(400).json({ error: 'orderedIds must not contain duplicates' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (let i = 0; i < orderedIds.length; i++) {
        await client.query('UPDATE todos SET position = $1 WHERE id = $2', [
          i,
          orderedIds[i],
        ]);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.json(await listTodos());
  } catch (err) {
    next(err);
  }
});

// DELETE /api/todos/completed — clear all completed tasks (must precede /:id)
router.delete('/completed', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM todos WHERE completed');
    res.json({ removed: result.rowCount });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/todos/:id — update a task
router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'invalid id' });
    }
    const { title, completed, priority, dueDate } = req.body;

    const fields = [];
    const values = [];
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'title must be a non-empty string' });
      }
      values.push(title.trim());
      fields.push(`title = $${values.length}`);
    }
    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'completed must be a boolean' });
      }
      values.push(completed);
      fields.push(`completed = $${values.length}`);
    }
    if (priority !== undefined) {
      if (!PRIORITIES.includes(priority)) {
        return res.status(400).json({ error: 'priority must be low, medium or high' });
      }
      values.push(priority);
      fields.push(`priority = $${values.length}`);
    }
    if (dueDate !== undefined) {
      const due = parseDueDate(dueDate);
      if (due.error) return res.status(400).json({ error: due.error });
      values.push(due.value);
      fields.push(`due_date = $${values.length}`);
    }
    if (fields.length === 0) {
      return res.status(400).json({ error: 'nothing to update' });
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE todos SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING ${COLUMNS}`,
      values
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'todo not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/todos/:id — delete a task
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'invalid id' });
    }
    const result = await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'todo not found' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
