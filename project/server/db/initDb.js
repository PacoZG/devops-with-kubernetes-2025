/* prettier-ignore */
import pkg from 'pg';
import {
  POSTGRES_DATABASE,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_USER
} from '../utils/appConfig.js';

const { Pool } = pkg;

export const pool = new Pool({
  host: POSTGRES_HOST,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DATABASE,
  port: 5432,
});

export const initDb = async () => {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
  await pool.query(`
      CREATE TABLE IF NOT EXISTS todos_table
      (
          id
          UUID
          PRIMARY
          KEY
          DEFAULT
          uuid_generate_v4
      (
      ),
          text VARCHAR
      (
          140
      ) NOT NULL,
          status VARCHAR
      (
          10
      ) NOT NULL
          );
  `);
};
