import { Router } from 'express'
import getHash from '../actions/getHash.js'
import getPings from '../services/getPings.js'
import { MESSAGE } from '../utils/appConfig.js'
import getInformationText from '../actions/getInformationText.js'

const hashReaderRouter = Router()

hashReaderRouter.get('/', async (req, res) => {
  console.log('[READER]: GET request to /api/strings done successfully')
  const hash = await getHash()
  const pings = await getPings()
  const text = await getInformationText()

  res.status(200).send(`
  <div style="background: black; color: darkorange; padding: 16px; border-radius: 6px">
    <div style="font-size: 20px; margin-bottom: 5px">file content: ${text}</div>
    <div style="font-size: 20px; margin-bottom: 5px">env variable: ${MESSAGE}</div>
    <div style="font-size: 24px; margin-bottom: 5px">${hash}</div>
    <label style="font-size: 20px">Ping / Pongs: ${pings}</label>
  </div>`)
})

hashReaderRouter.get('/health', (req, res) => {
  console.log('[READER]: GET request to /health done successfully')
  res.json({ message: 'ok' })
})

export default hashReaderRouter
