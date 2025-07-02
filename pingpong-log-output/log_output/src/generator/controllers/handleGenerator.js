import { Router } from 'express'
import { date_hash } from '../actions/generateHash.js'

const hashGeneratorRouter = Router()

hashGeneratorRouter.get('/', (req, res) => {
  console.log('[GENERATOR]: GET request to / done successfully')
  res.status(200).json({ message: 'ok' })
})

hashGeneratorRouter.get('/api/strings', (req, res) => {
  console.log('[GENERATOR]: GET request to /api/strings done successfully')

  res.status(200).json({ GENERATED_STRING: date_hash })
})

hashGeneratorRouter.get('/health', (req, res) => {
  console.log('[GENERATOR]: GET request to /health done successfully')
  res.status(200).json({ message: 'ok' })
})

export default hashGeneratorRouter
