import React from 'react'
import {createRoot} from 'react-dom/client'
import {NoComment} from '../lib/index.js'

const script = document.getElementById('nocomment')

const relays = script.dataset.relays
  ? JSON.parse(script.dataset.relays)
  : [
      'wss://nostr.zebedee.cloud',
      'wss://nostr.fmt.wiz.biz',
      'wss://nostr-pub.wellorder.net',
      'wss://relay.nostr.bg',
      'wss://nos.lol',
      'wss://no.str.cr',
      'wss://relay.damus.io'
    ]
const skip = script.dataset.skip || '/'
const owner = script.dataset.owner || ''
const customBaseEventId = script.dataset.customBaseEventId
const customBaseEventRelay = script.dataset.customBaseEventRelay

const container = document.createElement('div')
container.style.width = '100%'
script.parentNode.insertBefore(container, script)

const root = createRoot(container)
root.render(
  <NoComment
    customBaseEventId={customBaseEventId}
    customBaseEventRelay={customBaseEventRelay}
    skip={skip}
    relays={relays}
    owner={owner}
  />
)
