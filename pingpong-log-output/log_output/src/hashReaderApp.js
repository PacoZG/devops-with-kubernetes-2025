import 'dotenv/config'
import express, { Router } from 'express'
import cors from 'cors'
import http from 'http'
import fs from 'fs/promises'

const filePath = process.env.HASH_FILE_PATH

let date_hash

const getHash = async () => {
  try {
    date_hash = await fs.readFile(filePath, { encoding: 'utf8' })
    console.log('[READ_HASH]: ', date_hash)
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn('Hash file not found. Waiting for generator to create it...')
    } else {
      console.error('[ERROR]: ', error.message)
    }
  }
  setTimeout(getHash, 5000)
}

void getHash()

const hashReaderRouter = Router()

hashReaderRouter.get('/api/strings', (req, res) => {
  console.log('[READER]: GET request to /api/strings done successfully')
  res.status(200).json({ READ_STRING: date_hash })
})

hashReaderRouter.get('/health', (req, res) => {
  res.json({ message: 'ok' })
})

const hashReaderApp = express()

hashReaderApp.use(cors())
hashReaderApp.use('/', hashReaderRouter)

const PORT = process.env.READER_PORT

const server = http.createServer(hashReaderApp)

server.listen(PORT, () => {
  console.log(`Reader server started in port ${PORT}`)
})
