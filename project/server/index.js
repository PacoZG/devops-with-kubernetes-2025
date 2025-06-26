import 'dotenv/config'
import http from 'http'
import app from './app.js'
import { PORT } from './utils/appConfig.js'

import { initDb } from './db/initDb.js'

const server = http.createServer(app)

await initDb()

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})
