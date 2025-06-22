import { Router } from 'express';
import imageCache from '../services/imageCache.js';

const imageRouter = Router()

imageRouter.get('/', async (req, res) => {
  try {
    const imageBuffer = await imageCache()
    res.writeHead(200, { 'Content-Type': 'image/jpeg' })
    res.end(imageBuffer)
  } catch (err) {
    console.error('[ERROR]: Failed to get image', err.message)
    res.status(500).send('Error serving image')
  }
})

export default imageRouter
