import { Router } from 'express'

const greeterRouter = Router()

greeterRouter.get('/', (req, res) => {
  console.log('[GREETER]: GET request to /greeter endpoint done successfully')
  res.status(200).json({ message: 'Hello from version 2' })
})

export default greeterRouter
