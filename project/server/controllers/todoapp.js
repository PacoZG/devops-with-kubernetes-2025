const todoappRouter = require('express').Router()

const todo = { text: "I need to clean the house", status: "not-done" }

todoappRouter.get('/', async (req, res) => {
  return res.status(201).send(todo)
})

module.exports = todoappRouter