import 'dotenv/config'
import fs from 'fs/promises'
import { v4 } from 'uuid'

const filePath = process.env.HASH_FILE_PATH
let date_hash

const generateHash = async () => {
  const newString = v4()
  const newDate = new Date()
  date_hash = [newDate.toISOString(), newString].join(': ')

  try {
    await fs.writeFile(filePath, date_hash)
  } catch (error) {
    console.error('[ERROR]: ', error.message)
  }
  setTimeout(generateHash, 5000)
}

export { generateHash, date_hash }
