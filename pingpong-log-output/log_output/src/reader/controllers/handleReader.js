import { Router } from 'express'
import getHash from '../actions/getHash.js'
import getPings from '../services/getPings.js'

const hashReaderRouter = Router()

hashReaderRouter.get('/', async (req, res) => {
  console.log('[READER]: GET request to /api/strings done successfully')
  const hash = await getHash()
  const pings = await getPings()

  res.status(200).send(`
  <div style="background: black; color: white; padding: 16px; border-radius: 6px">
    <div style="font-size: 24px">${hash}</div>
    
    <br/>
    
    <label style="font-size: 20px">Ping / Pongs: ${pings}</label>
  </div>`)
})

hashReaderRouter.get('/health', (req, res) => {
  res.json({ message: 'ok' })
})

export default hashReaderRouter
