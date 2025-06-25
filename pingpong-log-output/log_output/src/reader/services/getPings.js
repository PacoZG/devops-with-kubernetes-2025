import axios from 'axios'
import { PING_SERVER_URL } from '../utils/appConfig.js'

const getPings = async () => {
  if (!PING_SERVER_URL) throw new Error('PING_SERVER_URL is not set')

  console.debug(`[READER]: Pingpong baseUrl ${PING_SERVER_URL}`)

  try {
    const response = await axios({
      method: 'GET',
      url: `${PING_SERVER_URL}/pings`,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.status !== 200) {
      console.info('RESPONSE: ', response)
      console.error(`[READER]: HTTP error! status: ${response.status}`)
    }

    console.info('RESPONSE DATA: ', response.data)
    const { pongs } = response.data

    return pongs
  } catch (error) {
    throw new Error(`[READER]: ${error.errors}`)
  }
}

export default getPings
