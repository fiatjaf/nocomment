import React from 'react'
import {createRoot} from 'react-dom/client'
import {NoComment} from '../lib/index.js'

const script = document.getElementById('nocomment')

const container = document.createElement('div')
container.style.width = '100%'
script.parentNode.insertBefore(container, script)

const root = createRoot(container)
root.render(
  <NoComment
    relays={[
      'wss://nostr.zebedee.cloud',
      'wss://nostr.fmt.wiz.biz',
      'wss://nostr-pub.wellorder.net',
      'wss://nostr-relay.untethr.me',
      'wss://relay.damus.io'
    ]}
  />
)
