import { Router } from 'express'
import getAllTodos from '../db/getAllTodos.js'
import storeTodo from '../db/storeTodo.js'
import getTodo from '../db/getTodo.js'
import { v4 as uuidv4 } from 'uuid'

const todoappRouter = Router()

todoappRouter.get('/', async (req, res) => {
  console.log('GET request to /api/todos done successfully')
  const todos = await getAllTodos()

  res.status(201).json(todos)
})

todoappRouter.get('/:id', async (req, res) => {
  console.log('GET request to /api/todos done successfully')
  const { id } = req.params
  const todo = await getTodo(id)

  res.status(201).json(todo)
})

todoappRouter.post('/', async (req, res) => {
  console.log('POST request to /api/todos done successfully')
  const { body } = req

  if (body.text.length > 140) {
    throw new Error(`[SERVER]: Text cannot be longer than 140 characters`)
  }

  const newTodo = { id: uuidv4(), text: body.text, status: 'not-done' }
  const todos = await storeTodo(newTodo)

  res.status(201).json(todos)
})

export default todoappRouter
