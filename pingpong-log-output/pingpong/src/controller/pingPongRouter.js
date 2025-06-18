import { Router } from 'express'
import getHash from '../hooks/getHash.js'
import getCounter from '../hooks/getCounter.js'
import setCounter from '../hooks/setCounter.js'

const pingPongRouter = Router()

pingPongRouter.get('/', async (req, res) => {
  let counter = await getCounter()
  counter = parseInt(counter, 10) || 0
  counter += 1

  await setCounter(String(counter))

  const hash = await getHash()
  console.log('GET request to /api/pingpong done successfully')

  res.status(200).send(`
  <div>
    <p>${hash}</p>
    <p>Ping / Pongs: ${counter}</p>
  </div>`)
})

pingPongRouter.get('/health', (req, res) => {
  res.status(200).json({ message: 'ok' })
})

export default pingPongRouter
