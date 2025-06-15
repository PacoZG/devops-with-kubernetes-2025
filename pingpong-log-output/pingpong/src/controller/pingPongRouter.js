import { Router } from 'express'

const pingPongRouter = Router()
let counter = 0

pingPongRouter.get('/', (req, res) => {
  counter++
  console.log('GET request to /api/pingpong done successfully')

  res.status(200).json({ pingpong: counter })
})

export default pingPongRouter
