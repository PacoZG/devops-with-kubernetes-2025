import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import http from 'http'
import fs from 'fs/promises'

const PORT = process.env.PORT || 3001

let date_hash

const getHash = async () => {
  try {
    date_hash = await fs.readFile('files/hash.txt', { encoding: 'utf8' })
    console.log('[READ_HASH]: ', date_hash)
  } catch (error) {
    console.log({ error: error.message })
  }
  setTimeout(getHash, 5000)
}

void getHash()

const hashReaderApp = express()

hashReaderApp.use(cors())

hashReaderApp.use('/api/strings', (req, res) => {
  console.log('GET request to /api/strings done successfully')
  res.status(200).send({ READ_STRING: date_hash })
})

hashReaderApp.get('/health', (req, res) => {
  res.send('ok')
})

const server = http.createServer(hashReaderApp)

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})
