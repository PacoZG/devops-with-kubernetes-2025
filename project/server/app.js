const express = require('express')
const cors = require('cors')

const app = express()

const todoappRouter = require('./controllers/todoapp')

app.use(cors())

app.use('/api/todos', todoappRouter)

app.get('/health', (req, res) => {
  res.json({ message: 'ok' })
})

module.exports = app
