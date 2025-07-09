import express from 'express'
import cors from 'cors'
import todoappRouter from './controllers/todo.js'
import imageRouter from './controllers/image.js'
import checkDbConnection from './db/checkDbConnection.js'

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

app.use('/healthz', async (_, res) => {
  try {
    const isDbConnected = await checkDbConnection()
    if (isDbConnected) {
      console.log(`Received a request to healthz and responding with status 200`)
      res.status(200).send('Application ready')
    } else {
      console.log(`Received a request to healthz and responding with status 500 - DB not connected`)
      res.status(500).send('Application not Ready - Database connection failed')
    }
  } catch (error) {
    console.error(`[ERROR] Healthz check failed:`, error.message)
    res.status(500).send('Application not Ready - Internal server error during health check')
  }
})

export default app
