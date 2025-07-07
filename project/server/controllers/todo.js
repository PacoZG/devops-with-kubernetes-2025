import { Router } from 'express'
import getAllTodos from '../db/getAllTodos.js'
import storeTodo from '../db/storeTodo.js'
import getTodo from '../db/getTodo.js'
import { v4 as uuidv4 } from 'uuid'

const todoappRouter = Router()

todoappRouter.get('/', async (req, res) => {
  try {
    console.log('[GET] /api/todos - Fetching all todos')
    const todos = await getAllTodos()
    res.status(200).json(todos)
  } catch (error) {
    console.error('[ERROR] Fetching all todos:', error.message)
    res.status(500).json({ error: 'Failed to fetch todos' })
  }
})

todoappRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    console.log(`[GET] /api/todos/${id} - Fetching todo`)
    const todo = await getTodo(id)
    res.status(200).json(todo)
  } catch (error) {
    console.error(`[ERROR] Fetching todo with ID ${req.params.id}:`, error.message)
    res.status(404).json({ error: 'Todo not found' })
  }
})

todoappRouter.post('/', async (req, res) => {
  try {
    const { body } = req
    if (!body.text || body.text.length > 140) {
      return res.status(400).json({ error: 'Text is required and must be 140 characters or less' })
    }

    const newTodo = { id: uuidv4(), text: body.text, status: 'not-done' }
    console.log('[POST] /api/todos - Creating new todo:', newTodo)

    const todos = await storeTodo(newTodo)
    res.status(201).json(todos)
  } catch (error) {
    console.error('[ERROR] Creating new todo:', error.message)
    res.status(500).json({ error: 'Failed to create todo' })
  }
})

export default todoappRouter
