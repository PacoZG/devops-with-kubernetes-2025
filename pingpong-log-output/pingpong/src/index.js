import 'dotenv/config'
import http from 'http'
import application from './application.js'
const PORT = process.env.PORT

const server = http.createServer(application)

server.listen(PORT, () => {
  console.log(`Pingpong Server started in port ${PORT}`)
})
