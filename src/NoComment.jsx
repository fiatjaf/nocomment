import React, {useState, useEffect, useRef} from 'react'
import useComputedState from 'use-computed-state'
import {useDebounce} from 'use-debounce'
import uniq from 'uniq'
import {generatePrivateKey, getPublicKey, relayPool} from 'nostr-tools'
import {queryName} from 'nostr-tools/nip05'
import Modal from './Modal'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import './NoComment.css'

import {normalizeURL, nameFromMetadata} from './util'

const url = normalizeURL(location.href)
const pool = relayPool()

export function NoComment({relays = []}) {
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [hasNip07, setNip07] = useState(false)
  const [publicKey, setPublicKey] = useState(null)
  const [events, setEvents] = useState({})
  const [editable, setEditable] = useState(true)
  const [notices, setNotices] = useState([])
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
      filter: {kinds: [34], '#r': [url]},
      cb: event => {
        if (event.id in events) return
        events[event.id] = event
        setEvents({...events})
      }
    })
    console.log('pool: ', pool)

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
          setNip07(true)
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
  // const wantedMetadata = wantedMetadataImmediate;

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
    () => Object.values(events).sort((a, b) => b.created_at - a.created_at),
    [events],
    []
  )

  return (
    <div className="comment-widget-container">
      <div className="comment-input-section">
        <textarea
          className="textarea"
          value={comment}
          readOnly={!editable}
          onChange={e => setComment(e.target.value)}
          autoFocus
        />
        <div className="comment-input-section-row2">
          <button className="info-button" onClick={infoEvent}>
            <svg
              className="svg-info"
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="24px"
              height="24px"
              viewBox="0 0 416.979 416.979"
              xmlSpace="preserve"
            >
              <g>
                <path
                  d="M356.004,61.156c-81.37-81.47-213.377-81.551-294.848-0.182c-81.47,81.371-81.552,213.379-0.181,294.85
                      c81.369,81.47,213.378,81.551,294.849,0.181C437.293,274.636,437.375,142.626,356.004,61.156z M237.6,340.786
                      c0,3.217-2.607,5.822-5.822,5.822h-46.576c-3.215,0-5.822-2.605-5.822-5.822V167.885c0-3.217,2.607-5.822,5.822-5.822h46.576
                      c3.215,0,5.822,2.604,5.822,5.822V340.786z M208.49,137.901c-18.618,0-33.766-15.146-33.766-33.765
                      c0-18.617,15.147-33.766,33.766-33.766c18.619,0,33.766,15.148,33.766,33.766C242.256,122.755,227.107,137.901,208.49,137.901z"
                />
              </g>
            </svg>
          </button>
          <button
            className="post-button"
            onClick={publishEvent}
            disabled={!editable}
          >
            {editable ? 'Post comment' : 'Submitting'}
          </button>
        </div>
      </div>
      <div>
        {notices.map(n => (
          <div className="notice-div" key={`${n.text}${n.time}`}>
            {n.text}
          </div>
        ))}
      </div>
      <div>
        {orderedEvents.map(evt => (
          <div className="comment-card" key={evt.id}>
            <div style={{fontFamily: 'monospace', fontSize: '1.2em'}}>
              <span className="comment-title">
                {' '}
                from <b> {evt.pubkey.slice(0, 10)}…</b>{' '}
              </span>
              <span style={{fontFamily: 'arial', fontSize: '0.7em'}}>
                {dayjs(evt.created_at * 1000).from(new Date())}
              </span>
            </div>
            <div style={{marginTop: '8px'}}>{evt.content}</div>
          </div>
        ))}
      </div>

      {isInfoOpen && (
        <Modal setIsOpen={setIsInfoOpen} title="Info">
          <span>
            Commenting as{' '}
            <em style={{color: 'green'}}>
              {nameFromMetadata(metadata[publicKey] || {pubkey: publicKey})}
            </em>{' '}
            using relays <br />
            {relays.map(url => (
              <em key={url} style={{color: 'orange', paddingRight: '5px'}}>
                {url} <br />
              </em>
            ))}
          </span>
        </Modal>
      )}
    </div>
  )

  function showNotice(text) {
    setNotices([...notices, {time: Date.now(), text}])
    setTimeout(() => {
      setNotices(notices.filter(n => n.time - Date.now() > 5000))
    }, 5050)
  }

  async function infoEvent() {
    setIsInfoOpen(true)
  }

  async function publishEvent(ev) {
    ev.preventDefault()

    setEditable(false)

    let event = {
      pubkey: publicKey,
      created_at: Math.round(Date.now() / 1000),
      kind: 34,
      tags: [['r', url]],
      content: comment
    }

    console.log('event: ', event)

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
      setEditable(true)
    }, 8000)

    console.log('publishing...')
    pool.publish(event, (status, relay) => {
      console.log('publish status: ', status, relay)
      switch (status) {
        case -1:
          showNotice(`failed to send ${JSON.stringify(event)} to ${relay}`)
          setEditable(true)
          break
        case 1:
          clearTimeout(publishTimeout)
          showNotice(`event ${event.id.slice(0, 5)}… published to ${relay}.`)
          setComment('')
          setEditable(true)
          break
      }
    })
  }
}
