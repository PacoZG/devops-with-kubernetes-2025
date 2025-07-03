import express from 'express'
import cors from 'cors'
import todoappRouter from './controllers/todo.js'
import imageRouter from './controllers/image.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/todos', todoappRouter)
app.use('/api/image', imageRouter)

app.get('/', (req, res) => {
  res.status(200).json({ message: 'OK' })
})

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'App is running' })
})

export default app
