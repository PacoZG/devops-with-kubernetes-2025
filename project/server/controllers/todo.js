import { Router } from 'express';
import shortUUID from 'short-uuid';

const todoappRouter = Router()

const todos = [
  { id: 'oJXTRfsdeFEfGTCSaFBoP4', text: 'I need to clean the house', status: 'not-done' },
  { id: 'eweWdtHpeiUrwo4sdfGWeg', text: 'Another to do', status: 'done' },
]

todoappRouter.get('/', (req, res) => {
  console.log('GET request to /api/todos done successfully')
  res.status(201).json(todos)
})

todoappRouter.post('/', async (req, res) => {
  console.log('POST request to /api/todos done successfully')
  const { body } = req
  const newTodo = {id: shortUUID().generate(), ...body}

  todos.push(newTodo)

  res.status(201).json(todos)
})

export default todoappRouter
