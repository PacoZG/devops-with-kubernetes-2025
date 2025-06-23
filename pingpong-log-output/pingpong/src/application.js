import express from 'express'
import cors from 'cors'
import pingPongRouter from './controller/pingPongRouter.js'

const application = express()

application.use(cors())
application.use(express.json())

application.use('/', pingPongRouter)

export default application
