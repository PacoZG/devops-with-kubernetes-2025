import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import greeterRouter from '../controllers/greeterRouter.js'

const greeterApp = express()
greeterApp.use(express.json())
greeterApp.use(cors())
greeterApp.use('/greetings', greeterRouter)

export default greeterApp
