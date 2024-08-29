import React from 'react'
import {createRoot} from 'react-dom/client'
import {NoComment} from '../src/NoComment.jsx'

const script = document.getElementById('nocomment')

const relays = script.dataset.relays
  ? JSON.parse(script.dataset.relays)
  : ['wss://nostr.wine', 'wss://nostr.mom', 'wss://nostr-pub.wellorder.net']
const skip = script.dataset.skip || '/'
const owner = script.dataset.owner || ''
const customBase = script.dataset.customBase
const placeholder = script.dataset.placeholder || ''
const readonly = script.dataset.readonly === 'true'

const container = document.createElement('div')
container.style.width = '100%'
script.parentNode.insertBefore(container, script)

const root = createRoot(container)
root.render(
  <NoComment
    customBase={customBase}
    skip={skip}
    relays={relays}
    owner={owner}
    placeholder={placeholder}
    readonly={readonly}
  />
)
