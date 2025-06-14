import express from 'express'
import cors from 'cors'
import stringRouter from './controllers/strings.js'

const application = express()

application.use(cors())

application.use('/api/strings', stringRouter)

application.get('/health', (req, res) => {
  res.status(200).json({ message: 'ok' })
})

export default application
