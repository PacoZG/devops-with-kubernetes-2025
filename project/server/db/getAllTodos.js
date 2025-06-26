import { pool } from './initDb.js'

const getAllTodos = async () => {
  try {
    const result = await pool.query('SELECT * FROM todos_table')

    return result.rows
  } catch (err) {
    console.log('[ERROR]: ', err.message)
    return []
  }
}

export default getAllTodos
