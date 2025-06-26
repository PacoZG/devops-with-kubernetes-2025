import pkg from 'pg'
import { POSTGRES_DATABASE, POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_USER } from '../utils/appConfig.js'

const { Pool } = pkg

export const pool = new Pool({
  host: POSTGRES_HOST,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DATABASE,
  port: 5432,
})

export const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS counter_table (
      id INT PRIMARY KEY DEFAULT 1,
      counter INT
    );
    INSERT INTO counter_table (id, counter) VALUES (1, 0)
    ON CONFLICT (id) DO NOTHING;
  `)
}
