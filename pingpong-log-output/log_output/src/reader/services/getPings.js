const getPings = async () => {
  const pingServerUrl = process.env.PING_SERVER_URL
  if (!pingServerUrl) throw new Error('PING_SERVER_URL is not set')

  console.log(`[READER]: Pingpong baseUrl ${pingServerUrl}`)

  try {
    const response = await fetch(`${pingServerUrl}/ping`, { method: 'GET' })

    if (!response.ok) throw new Error(`[READER]: HTTP error! status: ${response.status}`)
    const { pongs } = await response.json()

    return pongs
  } catch (error) {
    console.error('[READER]: Fetch failed ', error.message)
    throw error
  }
}

export default getPings
