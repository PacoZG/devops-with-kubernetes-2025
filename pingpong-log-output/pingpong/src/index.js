import 'dotenv/config'
import http from 'http'
import application from './application.js'
import { initDb } from './dbInit/initDb.js'
import { PORT } from './utils/appConfig.js'

const server = http.createServer(application)

await initDb()

server.listen(PORT, () => {
  console.log(`Pingpong Server started in port ${PORT}`)
})
