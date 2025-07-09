import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import hashGeneratorRouter from '../controllers/handleGenerator.js'
import { generateHash } from '../actions/generateHash.js'

void generateHash()

const hashGeneratorApp = express()

hashGeneratorApp.use(cors())
hashGeneratorApp.use('/', hashGeneratorRouter)

export default hashGeneratorApp
