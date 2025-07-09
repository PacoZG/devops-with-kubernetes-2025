import { pool } from './initDb.js'

const checkDbConnection = async () => {
  try {
    // Perform a simple query to check the connection
    await pool.query('SELECT 1')
    return true
  } catch (error) {
    console.error('Database connection check failed:', error.message)
    return false
  }
}

export default checkDbConnection
