import 'dotenv/config'
import fs from 'fs/promises'

const getHash = async () => {
  const filePath = process.env.HASH_FILE_PATH
  if (!filePath) {
    throw new Error('HASH_FILE_PATH environment variable is not set')
  }

  let date_hash
  try {
    date_hash = await fs.readFile(filePath, { encoding: 'utf8' })
    console.log(date_hash)
  } catch (error) {
    console.error('[ERROR]: ', error.message)
  }

  return date_hash
}

export default getHash
