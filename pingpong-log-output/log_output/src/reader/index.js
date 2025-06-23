import http from 'http'
import hashReaderApp from './apps/hashReaderApp.js'

const READER_PORT = process.env.READER_PORT

const readerServer = http.createServer(hashReaderApp)

readerServer.listen(READER_PORT, () => {
  console.log(`Reader server started in port ${READER_PORT}`)
})
