import http from 'http'
import hashReaderApp from './apps/hashReaderApp.js'
import { READER_PORT } from './utils/appConfig.js'

const readerServer = http.createServer(hashReaderApp)

readerServer.listen(READER_PORT, () => {
  console.log(`Reader server started in port ${READER_PORT}`)
})
