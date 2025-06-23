import express from 'express'
import cors from 'cors'
import hashReaderRouter from '../controllers/handleReader.js'
import getHash from '../actions/getHash.js'

void getHash()

const hashReaderApp = express()

hashReaderApp.use(cors())
hashReaderApp.use(express.json())
hashReaderApp.use('/', hashReaderRouter)

export default hashReaderApp
