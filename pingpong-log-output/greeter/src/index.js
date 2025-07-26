import http from 'http'
import greeterApp from './app/greeterApp.js'

const greeterPort = process.env.PORT

const greeterServer = http.createServer(greeterApp)

greeterServer.listen(greeterPort, () => {
  console.log(`Greeter Server listening on port ${greeterPort}`)
})
