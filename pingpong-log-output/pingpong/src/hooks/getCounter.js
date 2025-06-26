import { pool } from '../dbInit/initDb.js'

const getCounter = async () => {
  try {
    const result = await pool.query('SELECT counter FROM counter_table WHERE id = 1')

    return result.rows[0]?.counter ?? 0
  } catch (err) {
    console.log('[ERROR]: ', err.message)

    return 0
  }
}

export default getCounter
