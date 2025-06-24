import axios from 'axios'

const getPings = async () => {
  const pingServerUrl = process.env.PING_SERVER_URL
  if (!pingServerUrl) throw new Error('PING_SERVER_URL is not set')

  console.log(`[READER]: Pingpong baseUrl ${pingServerUrl}`)

  try {
    const response = await axios({
      method: 'GET',
      url: `${pingServerUrl}/pings`,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log('RESPONSE: ', response)

    if (response.status !== 200) {
      console.log('RESPONSE: ', response)
      throw new Error(`[READER]: HTTP error! status: ${response.status}`)
    }
    console.log('RESPONSE DATA: ', response.data)
    const { pongs } = response.data

    return pongs
  } catch (error) {
    console.error('[READER]: Fetch failed ', error.message)
    throw error
  }
}

export default getPings
