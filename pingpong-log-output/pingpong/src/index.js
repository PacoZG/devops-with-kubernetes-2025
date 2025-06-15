import 'dotenv/config'
import http from 'http'
import application from './application.js'
const PORT = process.env.PORT || 8000

const server = http.createServer(application)

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})
