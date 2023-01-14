import React from 'react'
import {createRoot} from 'react-dom/client'
import {NoComment} from '../lib/index.js'
import '../lib/index.css'

const script = document.getElementById('nocomment')

const style = document.createElement('link')
style.href = script.src.replace('.js', '.css')
style.rel = 'stylesheet'
document.head.appendChild(style)

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
      'wss://nostr-relay.untethr.me'
    ]}
  />
)
