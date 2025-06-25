import 'dotenv/config'
import fs from 'fs/promises'
import { HASH_FILE_PATH } from '../utils/appConfig.js'

const getHash = async () => {
  let date_hash

  try {
    date_hash = await fs.readFile(HASH_FILE_PATH, { encoding: 'utf8' })
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn('Hash file not found. Waiting for generator to create it...')
    } else {
      console.error('[ERROR]: ', error.message)
    }
  }
  setTimeout(getHash, 5000)

  return date_hash
}

export default getHash
