import React from 'react'
import {createRoot} from 'react-dom/client'

import Comments from '../src/widget.jsx'

createRoot(document.getElementById('comment-widget')).render(
  <Comments
    relays={[
      'wss://nostr.drss.io',
      'wss://nostr-relay.freeberty.net',
      'wss://nostr.unknown.place',
      'wss://nostr-relay.untethr.me',
      'wss://relay.damus.io'
    ]}
  />
)
