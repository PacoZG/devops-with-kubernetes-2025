import { Router } from 'express'
import stringGenerator from '../stringGenerator/stringGenerator.js'

const stringRouter = Router()

stringRouter.get('/', (req, res) => {
  console.log('GET request to /api/strings done successfully')

  res.status(201).json({ string: stringGenerator() })
})

export default stringRouter
