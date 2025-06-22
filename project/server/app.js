import express from 'express';
import cors from 'cors';
import todoappRouter from './controllers/todo.js';
import imageRouter from './controllers/image.js';

const app = express()

app.use(cors())

app.use('/api/todos', todoappRouter)
app.use('/api/image', imageRouter)

app.get('/health', (req, res) => {
  res.json({ message: 'ok' })
})

export default app
