import React, {useState, useEffect, useRef} from 'react'
import useComputedState from 'use-computed-state'
import useArray from 'use-array'
import {useBoolean} from 'use-boolean'
import {useDebounce} from 'use-debounce'
import uniq from 'uniq'
import {generatePrivateKey, getPublicKey, relayPool} from 'nostr-tools'
import {queryName} from 'nostr-tools/nip05'

import {normalizeURL, nameFromMetadata} from './util'

const url = normalizeURL(location.href)
const pool = relayPool()

export default function NostrComments({relays = []}) {
  const [comment, setComment] = useState('')
  const [hasNip07, setNip07] = useBoolean(false)
  const [publicKey, setPublicKey] = useState(null)
  const [events, setEvents] = useState({})
  const [editable, enable, disable] = useBoolean(true)
  const [notices, {push: pushNotice, filter: filterNotices}] = useArray([])
  const [metadata, setMetadata] = useState({})
  const metasubRef = useRef(null)

  useEffect(() => {
    relays.forEach(url => {
      pool.addRelay(url, {read: true, write: true})
    })

    pool.onNotice((notice, relay) => {
      showNotice(`${relay.url} says: ${notice}`)
    })

    let sub = pool.sub({
      filter: {'#r': [url]},
      cb: event => {
        if (event.id in events) return
        events[event.id] = event
        setEvents({...events})
      }
    })

    return () => {
      sub.unsub()
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      // check if they have a nip07 nostr extension
      if (window.nostr) {
        try {
          // and if it has a key stored on it
          const pubkey = await window.nostr.getPublicKey()
          setNip07()
          setPublicKey(pubkey)
        } catch (err) {}
      } else {
        // otherwise use a key from localStorage or generate a new one
        let privateKey = localStorage.getItem('nostrkey')
        if (!privateKey) {
          privateKey = generatePrivateKey()
          localStorage.setItem('nostrkey', privateKey)
        }
        pool.setPrivateKey(privateKey)
        setPublicKey(getPublicKey(privateKey))
      }
    })()
  }, [])

  const wantedMetadataImmediate = useComputedState(
    () => uniq(Object.values(events).map(ev => ev.pubkey)),
    [events],
    []
  )
  const [wantedMetadata] = useDebounce(wantedMetadataImmediate, 2000)

  useEffect(() => {
    if (!publicKey) return

    const filter = {authors: wantedMetadata.concat(publicKey)}
    if (metasubRef.current) {
      // update metadata subscription with new keys
      metasubRef.current.sub({filter})
    } else {
      // start listening for metadata information
      metasubRef.current = pool.sub({
        filter,
        cb: event => {
          if (
            !metadata[event.pubkey] ||
            metadata[event.pubkey].created_at < event.created_at
          ) {
            metadata[event.pubkey] = event
            setMetadata({...metadata})

            try {
              const nip05 = JSON.parse(event.content).nip05
              queryName(nip05).then(name => {
                if (name === nip05) {
                  event.nip05verified = true
                }
              })
            } catch (err) {}
          }
        }
      })
    }

    return () => {
      metasubRef.current.unsub()
    }
  }, [publicKey, wantedMetadata])

  const orderedEvents = useComputedState(
    () => Object.values(events).sort((a, b) => a.created_at - b.created_at),
    [events],
    []
  )

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          padding: '4px',
          margin: '6px',
          border: '1px solid orange'
        }}
      >
        <span style={{textAlign: 'right'}}>
          commenting on <em style={{color: 'blue'}}>{url}</em> as{' '}
          <em style={{color: 'green'}}>
            {nameFromMetadata(metadata[publicKey] || {pubkey: publicKey})}
          </em>{' '}
          using relays{' '}
          {relays.map(url => (
            <em key={url} style={{color: 'orange', paddingRight: '5px'}}>
              {url}
            </em>
          ))}
        </span>
        <textarea
          value={comment}
          readOnly={!editable}
          onChange={e => setComment(e.target.value)}
          autoFocus
          style={{border: 'none', outline: 'none', width: '100%'}}
        />
        <button style={{margin: '4px 0 4px'}} onClick={publishEvent}>
          post comment
        </button>
      </div>
      <div>
        {orderedEvents.map(evt => (
          <div
            key={evt.id}
            style={{
              padding: '8px',
              margin: '6px',
              border: '1px solid silver'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '90%',
                fontFamily: 'monospace'
              }}
            >
              <div>from {evt.pubkey.slice(0, 5)}…</div>
              <div>
                {new Date(evt.created_at * 1000).toISOString().split('T')[0]}
              </div>
            </div>
            <div style={{fontSize: '110%'}}>{evt.content}</div>
          </div>
        ))}
      </div>
      <div style={{backgroundColor: 'yellow'}}>
        {notices.map(n => (
          <div key={`${n.text}${n.time}`}>{n.text}</div>
        ))}
      </div>
    </div>
  )

  function showNotice(text) {
    pushNotice({time: Date.now(), text})
    setTimeout(() => {
      filterNotices(n => n.time - Date.now() > 5000)
    }, 5050)
  }

  async function publishEvent(ev) {
    ev.preventDefault()

    disable()

    let event = {
      pubkey: publicKey,
      created_at: Math.round(Date.now() / 1000),
      kind: 1,
      tags: [['r', url]],
      content: comment
    }

    // we will sign this event using the nip07 extension if it was detected
    // otherwise it should just be signed automatically when we call .publish()
    if (hasNip07) {
      const response = await window.nostr.signEvent(event)
      if (response.error) {
        throw new Error(response.error)
      }
      event = response
    }

    const publishTimeout = setTimeout(() => {
      showNotice(
        `failed to publish event ${event.id.slice(0, 5)}… to any relay.`
      )
      enable()
    }, 4000)

    pool.publish(event, (status, relay) => {
      switch (status) {
        case -1:
          showNotice(`failed to send ${JSON.stringify(event)} to ${relay}`)
          enable()
          break
        case 1:
          clearTimeout(publishTimeout)
          showNotice(`event ${event.id.slice(0, 5)}… published to ${relay}.`)
          setComment('')
          enable()
          break
      }
    })
  }
}
