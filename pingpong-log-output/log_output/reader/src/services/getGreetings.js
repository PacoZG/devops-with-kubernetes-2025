import axios from 'axios'
import { GREETER_SERVER_URL } from '../utils/appConfig.js'

const getGreetings = async () => {
  if (!GREETER_SERVER_URL) throw new Error('PING_SERVER_URL is not set')

  console.debug(`[READER]: Pingpong baseUrl ${GREETER_SERVER_URL}`)

  try {
    const response = await axios({
      method: 'GET',
      url: `${GREETER_SERVER_URL}/greetings`,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.status !== 200) {
      console.info('RESPONSE: ', response)
      console.error(`[READER]: HTTP error! status: ${response.status}`)
    }

    console.info('RESPONSE DATA: ', response.data)
    const { message } = response.data

    return message
  } catch (error) {
    throw new Error(`[READER]: ${error.errors}`)
  }
}

export default getGreetings
