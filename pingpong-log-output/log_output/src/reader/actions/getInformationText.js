import fs from 'fs/promises'
import { INFORMATION_FILE_PATH } from '../utils/appConfig.js'

const getInformationText = async () => {
  console.log('text file path:', INFORMATION_FILE_PATH)
  let text

  try {
    text = await fs.readFile(INFORMATION_FILE_PATH, { encoding: 'utf8' })
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn('Information file not found. Waiting for generator to create it...')
    } else {
      console.error('[ERROR]: ', error.message)
    }
  }

  return text
}

export default getInformationText
