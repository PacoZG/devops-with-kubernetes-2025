import 'dotenv/config'
import fs from 'fs/promises'

const filePath = process.env.HASH_FILE_PATH
let date_hash

const getHash = async () => {
  try {
    date_hash = await fs.readFile(filePath, { encoding: 'utf8' })
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
