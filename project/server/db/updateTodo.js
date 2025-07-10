import { pool } from './initDb.js'

const updateTodo = async id => {
  try {
    const todoToUpdate = await pool.query(`SELECT * FROM todos_table WHERE id = $1`, [id])

    if (!todoToUpdate) {
      console.log(`No todo found with ID: ${id}`)

      return null
    }

    const status = todoToUpdate.rows[0].status
    let newStatus

    if (status === 'not-done') {
      newStatus = 'done'
    } else if (status === 'done') {
      newStatus = 'not-done'
    }

    const updateTodo = await pool.query(`UPDATE todos_table SET status = $1 WHERE id = $2 RETURNING *`, [newStatus, id])

    return updateTodo.rows[0]
  } catch (error) {
    console.error(`Error toggling todo status for ID ${id}:`, error.message)

    return null
  }
}

export default updateTodo
