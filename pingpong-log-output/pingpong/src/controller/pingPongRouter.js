import { Router } from 'express'
import getCounter from '../hooks/getCounter.js'
import setCounter from '../hooks/setCounter.js'

const pingPongRouter = Router()

pingPongRouter.get('/pingpong', async (req, res) => {
  let counter = await getCounter()
  counter = parseInt(counter, 10) || 0
  counter += 1

  await setCounter(String(counter))
  console.log('GET request to /api/pingpong done successfully')

  res.status(200).send(`
  <div>
    <p>Ping / Pongs: ${counter}</p>
  </div>`)
})

pingPongRouter.get('/health', (req, res) => {
  res.status(200).json({ message: 'ok' })
})

pingPongRouter.get('/pings', async (req, res) => {
  res.status(200).json({ pongs: await getCounter() })
})

export default pingPongRouter
