const express = require('express')
const app = express()

const todoappRouter = require('./controllers/todoapp')

app.use('/', todoappRouter)

module.exports = app
