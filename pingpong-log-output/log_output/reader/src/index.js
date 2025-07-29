import http from 'http'
import hashReaderApp from './apps/hashReaderApp.js'
import { PORT, READER_PORT } from './utils/appConfig.js'

const readerPort = READER_PORT || PORT

const readerServer = http.createServer(hashReaderApp)

readerServer.listen(readerPort, () => {
  console.log(`Reader server started in port ${readerPort}`)
})
