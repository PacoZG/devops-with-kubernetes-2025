import fs from 'fs/promises'

const getCounter = async () => {
  const filePath = process.env.COUNT_FILE_PATH
  if (!filePath) {
    throw new Error('HASH_FILE_PATH environment variable is not set')
  }

  let count
  try {
    count = await fs.readFile(filePath, { encoding: 'utf8' })
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File does not exist, create it with default value '0'
      await fs.writeFile(filePath, '0', { encoding: 'utf8' })
      count = '0'
      console.log('File not found. Created new file with count 0.')
    } else {
      console.error('[ERROR]: ', error.message)
    }
  }

  return count
}

export default getCounter
