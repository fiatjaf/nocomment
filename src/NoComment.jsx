import React, {useState, useEffect, useRef} from 'react'
import {useDebounce} from 'use-debounce'
import {
  generatePrivateKey,
  getPublicKey,
  relayInit,
  getEventHash,
  signEvent,
  nip05
} from 'nostr-tools'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import {
  normalizeURL,
  nameFromMetadata,
  insertEventIntoDescendingList
} from './util'
import {
  Container,
  InputSection,
  InputSectionRow2,
  InfoButton,
  PostButton,
  Notice,
  SvgInfo,
  Textarea,
  CommentCard,
  CommentTitle
} from './components'

export function NoComment({url = normalizeURL(location.href), relays = []}) {
  const [notices, setNotices] = useState([])
  const [baseEventImmediate, setBaseEvent] = useState(null)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [privateKey, setPrivateKey] = useState(null)
  const [publicKey, setPublicKey] = useState(null)
  const [events, setEvents] = useState([])
  const [editable, setEditable] = useState(true)
  const [metadata, setMetadata] = useState({})
  const baseEventRelay = useRef('')
  const metadataFetching = useRef({})
  const connections = useRef(relays.map(url => relayInit(url)))

  useEffect(() => {
    connections.current.forEach(conn => {
      conn.connect()
    })

    return () => {
      connections.current.forEach(conn => {
        conn.close()
      })
    }
  }, [connections.current])

  useEffect(() => {
    connections.current.forEach(conn => {
      const sub = conn.sub([
        {
          '#r': [url],
          kinds: [1]
        }
      ])
      sub.on('event', event => {
        if (
          !baseEventImmediate ||
          baseEventImmediate.created_at < event.created_at
        ) {
          setBaseEvent(event)
          baseEventRelay.current = conn.url
        }
      })
      sub.on('eose', () => {
        sub.unsub()
      })
    })
  }, [url])

  const [baseEvent] = useDebounce(baseEventImmediate, 1000)

  useEffect(() => {
    if (!baseEvent) return

    let subs = connections.current.forEach(conn => {
      let sub = conn.sub([
        {
          '#e': [baseEvent.id],
          kinds: [1]
        }
      ])
      sub.on('event', event => {
        setEvents(insertEventIntoDescendingList(events, event))

        fetchMetadata(event.pubkey)
      })
      return sub
    })

    return () => {
      subs.forEach(sub => {
        sub.unsub()
      })
    }
  }, [baseEvent])

  useEffect(() => {
    setTimeout(async () => {
      // check if they have a nip07 nostr extension
      if (window.nostr) {
        try {
          // and if it has a key stored on it
          const pubkey = await window.nostr.getPublicKey()
          setPublicKey(pubkey)
        } catch (err) {}
      } else {
        // otherwise use a key from localStorage or generate a new one
        let privateKey = localStorage.getItem('nostrkey')
        if (!privateKey) {
          privateKey = generatePrivateKey()
          localStorage.setItem('nostrkey', privateKey)
        }
        setPrivateKey(privateKey)
        setPublicKey(getPublicKey(privateKey))
      }
    }, 600)
  }, [])

  let selfName = nameFromMetadata(metadata[publicKey] || {pubkey: publicKey})

  return (
    <Container>
      <InputSection>
        <Textarea
          value={comment}
          readOnly={!editable}
          onChange={e => setComment(e.target.value)}
          autoFocus
        />
        <InputSectionRow2>
          <InfoButton onClick={infoEvent}>
            <SvgInfo
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
            </SvgInfo>
          </InfoButton>
          <PostButton onClick={publishEvent} disabled={!editable}>
            {editable ? 'Post comment' : 'Submitting'}
          </PostButton>
        </InputSectionRow2>
      </InputSection>
      <div>
        {events.map(evt => (
          <CommentCard key={evt.id}>
            <div style={{fontFamily: 'monospace', fontSize: '1.2em'}}>
              <CommentTitle>
                {' '}
                from <b> {evt.pubkey.slice(0, 10)}…</b>{' '}
              </CommentTitle>
              <span style={{fontFamily: 'arial', fontSize: '0.7em'}}>
                {dayjs(evt.created_at * 1000).from(new Date())}
              </span>
            </div>
            <div style={{marginTop: '8px'}}>{evt.content}</div>
          </CommentCard>
        ))}
      </div>

      {isInfoOpen && (
        <span>
          Commenting{' '}
          {selfName !== '_' && (
            <>
              as <em style={{color: 'green'}}>{selfName}</em>
            </>
          )}{' '}
          using relays <br />
          {relays.map(url => (
            <em key={url} style={{color: 'orange', paddingRight: '5px'}}>
              {url} <br />
            </em>
          ))}
        </span>
      )}

      {notices.map(notice => (
        <Notice>{notice}</Notice>
      ))}
    </Container>
  )

  async function fetchMetadata(pubkey) {
    if (pubkey in metadata) return
    if (pubkey in metadataFetching.current) return
    metadataFetching.current[pubkey] = true
    let done = 0

    connections.current.forEach(conn => {
      let sub = conn.sub([{kinds: [0], authors: [pubkey]}])
      done++
      sub.on('event', event => {
        try {
          if (
            !metadata[pubkey] ||
            metadata[pubkey].created_at < event.created_at
          ) {
            setMetadata(curr => ({
              ...curr,
              [pubkey]: {
                ...JSON.parse(event.content),
                created_at: event.created_at
              }
            }))
          }
        } catch (err) {
          /***/
        }
      })
      sub.on('eose', () => {
        sub.unsub()
        done--

        if (done === 0) fetchNIP05(pubkey, metadata[pubkey])
      })
    })
  }

  async function fetchNIP05(pubkey, meta) {
    if (meta && meta.nip05)
      nip05.queryProfile(meta.nip05).then(name => {
        if (name === meta.nip05) {
          setMetadata(curr => ({
            ...curr,
            [pubkey]: {...meta, nip05verified: true}
          }))
        }
      })
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
      kind: 1,
      tags: [['e', baseEvent.id, baseEventRelay]],
      content: comment
    }

    console.log('event: ', event)

    // if we have a private key that means it was generated locally and we don't have a nip07 extension
    if (privateKey) {
      event.id = getEventHash(event)
      event.sig = signEvent(event, privateKey)
    } else {
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

    relays.forEach(conn => {
      let pub = conn.publish(event)
      pub.on('ok', () => {
        clearTimeout(publishTimeout)
        showNotice(`event ${event.id.slice(0, 5)}… published to ${conn.url}.`)
        setComment('')
        setEditable(true)
      })
    })
  }

  function showNotice(text) {
    setNotices([...notices, {time: Date.now(), text}])
    setTimeout(() => {
      setNotices(notices.filter(n => n.time - Date.now() > 5000))
    }, 5050)
  }
}
