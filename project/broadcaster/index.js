import 'dotenv/config'
import axios from 'axios'
import { connect, StringCodec } from 'nats'

const natsSC = StringCodec()
const NATS_URL = process.env.NATS_URL
const DISCORD_URL = process.env.DISCORD_URL || null
console.log({ DISCORD_URL })
if (NATS_URL) {
  console.log({ NATS_URL })
  console.log('Broadcaster started')
  connect({ servers: NATS_URL }).then(async conn => {
    // console.log('Sending message: 1')
    const sub = conn.subscribe('todo_created', { queue: 'broadcaster.workers' })
    // console.log('Sending message: 2', sub)
    for await (const message of sub) {
      console.log(`[BROADCASTER]: Sending message: ${natsSC.decode(message.data)}`)
      const m_json = { 'content': natsSC.decode(message.data) }

      if (DISCORD_URL) {
        console.log('[BROADCASTER]: Sending message to Discord disabled:', DISCORD_URL)
        await axios.post(DISCORD_URL, m_json)
      }
    }
  })
} else {
  console.log('No NATS URL has been provided')
}
