import 'dotenv/config'
import express, { Router } from 'express'
import { v4 } from 'uuid'
import cors from 'cors'
import http from 'http'
import fs from 'fs/promises'

const filePath = process.env.FILE_PATH || 'files/hash.txt'
let date_hash

const stringGen = () => {
  const newString = v4()
  const newDate = new Date()
  date_hash = [newDate.toISOString(), newString].join(': ')
  console.log('[GENERATED_HASH]', date_hash)
  try {
    void fs.writeFile(filePath, date_hash)
  } catch (error) {
    console.log({ error: error.message })
  }
  setTimeout(stringGen, 5000)

  return date_hash
}

stringGen()

const stringRouter = Router()

stringRouter.get('/', (req, res) => {
  console.log('GET request to /api/strings done successfully')

  res.status(200).json({ GENERATED_STRING: stringGen() })
})

const hashGeneratorApp = express()

hashGeneratorApp.use(cors())

hashGeneratorApp.use('/api/strings', stringRouter)

hashGeneratorApp.get('/health', (req, res) => {
  res.status(200).json({ message: 'ok' })
})

const PORT = process.env.PORT || 3002
const server = http.createServer(hashGeneratorApp)

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})
