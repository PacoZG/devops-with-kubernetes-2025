import axios from 'axios'
import express from 'express'
import * as k8s from '@kubernetes/client-node'

const app = express()
const kc = new k8s.KubeConfig()
const port = process.env.PORT || 3000

kc.loadFromDefault()

let watchReq = null
let latestPage = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <Title>No content yet</Title>
  </head>
  <body>
    <h1>No site added yet, create a dummysite resource!</h1>
  </body>
</html>
`
const watch = new k8s.Watch(kc)

async function fetchAndSaveSite(url) {
  const response = await axios.get(url)
  latestPage = response.data
}

watch
  .watch(
    '/apis/stable.dwk/v1/dummysites',
    // optional query parameters can go here.
    {
      allowWatchBookmarks: true,
    },
    // callback is called for each received object.
    (type, apiObj, watchObj) => {
      if (type === 'ADDED') {
        const url = apiObj?.spec?.website_url
        if (!url || typeof url !== 'string') {
          return
        }

        void fetchAndSaveSite(url)
      } else if (type === 'MODIFIED') {
        console.log('changed object:')
      } else if (type === 'DELETED') {
        console.log('deleted object:')
      } else if (type === 'BOOKMARK') {
        console.log(`bookmark: ${watchObj.metadata.resourceVersion}`)
      } else {
        console.log('unknown type: ' + type)
      }
      console.log('[DUMMY_SITE]: New object:', JSON.stringify(apiObj))
    },
    // done callback is called if the watch terminates normally
    err => {
      console.log(err)
    }
  )
  .then(req => {
    // watch returns a request object which you can use to abort the watch.
    watchReq = req
  })

process.on('SIGTERM', () => {
  if (watchReq !== null) {
    watchReq.abort()
  }
})

app.get('/', (req, res) => res.send(latestPage))
app.listen(port, () => console.log(`Server listening on ${port}`))
