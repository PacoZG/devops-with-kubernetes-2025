import http from 'http'
import hashGeneratorApp from './apps/hashGeneratorApp.js'

const GEN_PORT = process.env.GENERATOR_PORT

const genServer = http.createServer(hashGeneratorApp)

genServer.listen(GEN_PORT, () => {
  console.log(`Generator server started in port ${GEN_PORT}`)
})
