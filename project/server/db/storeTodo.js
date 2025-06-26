import { pool } from './initDb.js'

const storeTodo = async ({ id, text, status }) => {
  try {
    await pool.query(
      `INSERT INTO todos_table (id, text, status)
       VALUES ($1, $2, $3) ON CONFLICT (id) DO
      UPDATE
          SET status = EXCLUDED.status`,
      [id, text, status]
    )

    return await pool.query('SELECT * FROM todos_table').rows
  } catch (err) {
    console.log('[ERROR]: ', err.message)
  }
}

export default storeTodo
