import { pool } from '../db/initDb.js'

const getTodo = async id => {
  try {
    const result = await pool.query('SELECT * FROM todos_table WHERE id = $1', [id])

    return result.rows[0] || null
  } catch (err) {
    console.log('[ERROR]: ', err.message)

    return null
  }
}

export default getTodo
