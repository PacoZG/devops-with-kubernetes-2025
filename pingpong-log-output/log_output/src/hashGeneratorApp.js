import 'dotenv/config'
import express, { Router } from 'express'
import { v4 } from 'uuid'
import cors from 'cors'
import http from 'http'
import fs from 'fs/promises'

const filePath = process.env.HASH_FILE_PATH
let date_hash

const stringGen = async () => {
  const newString = v4()
  const newDate = new Date()
  date_hash = [newDate.toISOString(), newString].join(': ')

  try {
    await fs.writeFile(filePath, date_hash)
  } catch (error) {
    console.error('[ERROR]: ', error.message)
  }
  setTimeout(stringGen, 5000)
}

void stringGen()

const hashGeneratorRouter = Router()

hashGeneratorRouter.get('/api/strings', (req, res) => {
  console.log('[GENERATOR]: GET request to /api/strings done successfully')

  res.status(200).json({ GENERATED_STRING: date_hash })
})

hashGeneratorRouter.get('/health', (req, res) => {
  res.status(200).json({ message: 'ok' })
})

const hashGeneratorApp = express()

hashGeneratorApp.use(cors())
hashGeneratorApp.use('/', hashGeneratorRouter)

const PORT = process.env.GENERATOR_PORT
const server = http.createServer(hashGeneratorApp)

server.listen(PORT, () => {
  console.log(`Generator server started in port ${PORT}`)
})
