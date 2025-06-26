import { Router } from 'express'
import getCounter from '../hooks/getCounter.js'
import setCounter from '../hooks/setCounter.js'

const pingPongRouter = Router()

pingPongRouter.get('/pingpong', async (req, res) => {
  console.log('GET request to /api/pingpong done successfully')
  let counter = await getCounter()
  counter += 1
  await setCounter(counter)

  res.status(200).send(`
  <div>
    <p>Ping / Pongs: ${counter}</p>
  </div>`)
})

pingPongRouter.get('/pings', async (req, res) => {
  res.status(200).json({ pongs: await getCounter() })
})

pingPongRouter.get('/reset', async (req, res) => {
  await setCounter(0)
  res.status(200).json({ message: 'Counter reset to 0' })
})

pingPongRouter.get('/health', (req, res) => {
  res.status(200).json({ message: 'ok' })
})

export default pingPongRouter
