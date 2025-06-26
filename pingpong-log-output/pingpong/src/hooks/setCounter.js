import { pool } from '../dbInit/initDb.js'

const setCounter = async counter => {
  try {
    await pool.query(
      'INSERT INTO counter_table (id, counter) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET counter = $1',
      [counter]
    )
  } catch (err) {
    console.log('[ERROR]: ', err.message)
  }
}

export default setCounter
