import express from 'express'
import cors from 'cors'
import pingPongRouter from './controller/pingPongRouter.js'

const application = express()

application.use(cors())

application.use('/pingpong', pingPongRouter)

application.get('/health', (req, res) => {
  res.status(200).json({ message: 'ok' })
})

export default application
