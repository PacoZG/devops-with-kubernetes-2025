import fs from 'fs/promises'
import 'dotenv/config'

const setCounter = async counter => {
  const filePath = process.env.COUNT_FILE_PATH
  if (!filePath) {
    throw new Error('COUNT_FILE_PATH environment variable is not set')
  }

  try {
    await fs.writeFile(filePath, counter)
  } catch (error) {
    console.error('[ERROR]: ', error.message)
  }
}

export default setCounter
