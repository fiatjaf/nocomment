import React, {useState, useEffect, useRef, useMemo} from 'react'
import {useDebounce} from 'use-debounce'
import {
  generatePrivateKey,
  getPublicKey,
  relayInit,
  getEventHash,
  signEvent,
  nip05
} from 'nostr-tools'

import {normalizeURL, insertEventIntoDescendingList, getName} from './util'
import {
  Container,
  InputSection,
  InputSectionRow2,
  InfoButton,
  PostButton,
  Notice,
  SvgInfo,
  Textarea,
  Info
} from './components'
import Thread, {computeThreads} from './Thread'

export function NoComment({
  url = normalizeURL(location.href),
  relays = [],
  owner,
  skip
}) {
  const [notices, setNotices] = useState([])
  const [baseEventImmediate, setBaseEvent] = useState(null)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [privateKey, setPrivateKey] = useState(null)
  const [publicKey, setPublicKey] = useState(null)
  const [eventsImmediate, setEvents] = useState([])
  const [editable, setEditable] = useState(true)
  const [metadata, setMetadata] = useState({})
  const baseEventRelay = useRef('')
  const metadataFetching = useRef({})
  const connections = useRef(relays.map(url => relayInit(url)))
  const [baseEvent] = useDebounce(baseEventImmediate, 1000)
  const [events] = useDebounce(eventsImmediate, 1000, {leading: true})
  const threads = useMemo(() => computeThreads(events), [events])

  useEffect(() => {
    connections.current.forEach(async conn => {
      await conn.connect()

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
  }, [])

  useEffect(() => {
    if (!baseEvent) return

    let subs = connections.current.map(conn => {
      let sub = conn.sub([
        {
          '#e': [baseEvent.id],
          kinds: [1]
        }
      ])
      sub.on('event', event => {
        setEvents(events => insertEventIntoDescendingList(events, event))
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

  if (skip && skip !== '' && skip === location.pathname) return

  let selfName = getName(metadata, publicKey)

  return (
    <Container>
      <InputSection>
        <Textarea
          value={comment}
          readOnly={!editable}
          onChange={e => setComment(e.target.value)}
        />
        <InputSectionRow2>
          <InfoButton onClick={handleSettingsClick}>
            <SvgInfo
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="24px"
              height="24px"
              viewBox="70 100 550 400"
            >
              <g>
                <path d="m602.88 231c-28-10.5-49-28.875-63.875-56.875-14.875-28.875-19.25-54.25-13.125-80.5 2.625-12.25-1.75-22.75-12.25-28.875l-20.125-12.25c-8.75-5.25-18.375-11.375-27.125-16.625-11.375-7-21.875-5.25-28.875-1.75-1.75 0.875-4.375 2.625-6.125 4.375l-1.75 1.75c-5.25 4.375-10.5 8.75-16.625 11.375-1.75 0.875-3.5 1.75-6.125 2.625-22.75 7.875-43.75 11.375-63 10.5-24.5-1.75-47.25-12.25-67.375-29.75-7-6.125-17.5-11.375-32.375-3.5-15.75 8.75-31.5 18.375-49 27.125-11.375 6.125-15.75 15.75-14 28.875 7.875 46.375-9.625 86.625-53.375 121.62l-5.25 2.625c-5.25 3.5-12.25 5.25-18.375 7.875l-1.75 0.875c-2.625 0.875-4.375 1.75-7 2.625-8.75 5.25-14 13.125-14 23.625s0 21-0.875 30.625v3.5 21.875c0 12.25 6.125 21.875 18.375 26.25 25.375 8.75 44.625 25.375 61.25 54.25 15.75 27.125 21 55.125 14 84-2.625 11.375 1.75 21 12.25 27.125 18.375 11.375 34.125 21 49.875 30.625 1.75 0.875 6.125 3.5 12.25 4.375 4.375 0 8.75-0.875 12.25-2.625 2.625-0.875 4.375-3.5 7-5.25 4.375-4.375 9.625-8.75 16.625-12.25 19.25-10.5 46.375-15.75 73.5-13.125s50.75 12.25 63.875 27.125c1.75 2.625 8.75 8.75 18.375 9.625h1.75c5.25 0 9.625-1.75 15.75-4.375 8.75-5.25 16.625-9.625 23.625-13.125 5.25-3.5 14-7.875 22.75-12.25 9.625-5.25 19.25-14.875 14-33.25-5.25-19.25-0.875-43.75 11.375-68.25s30.625-44.625 49.875-55.125c6.125-3.5 13.125-6.125 19.25-7 8.75-1.75 14.875-7 17.5-13.125 1.75-3.5 2.625-7 2.625-11.375 0.875-20.125 0.875-41.125 0.875-58.625 0-13.125-6.125-21.875-16.625-25.375zm-5.25 24.5c0 17.5 0 37.625-0.875 57.75 0 0.875 0 2.625-0.875 2.625 0 0 0 0.875-2.625 0.875-8.75 1.75-16.625 5.25-25.375 9.625-23.625 13.125-44.625 36.75-58.625 64.75-14.875 28.875-19.25 59.5-13.125 84 0.875 3.5 1.75 5.25-3.5 7.875-8.75 4.375-17.5 9.625-23.625 13.125-5.25 3.5-14 7.875-22.75 13.125-2.625 0.875-4.375 1.75-5.25 1.75s-1.75 0-4.375-2.625c-16.625-18.375-45.5-30.625-77.875-34.125-5.25-0.875-11.375-0.875-16.625-0.875-25.375 0-49.875 6.125-69.125 16.625-7.875 4.375-15.75 9.625-21 15.75 0 1.75-0.875 1.75-1.75 1.75s-1.75 0-2.625-0.875c-15.75-9.625-31.5-18.375-49.875-29.75-2.625-1.75-2.625-1.75-1.75-3.5 7.875-35 2.625-67.375-16.625-100.62s-42.875-53.375-72.625-63.875c-3.5-0.875-3.5-1.75-3.5-5.25v-21.875-3.5c0-9.625 0-20.125 0.875-30.625 0-3.5 0.875-4.375 2.625-5.25 0.875-0.875 1.75-0.875 3.5-1.75l1.75-0.875c7-2.625 14.875-5.25 21.875-9.625 3.5-1.75 6.125-3.5 8.75-6.125 50.75-40.25 70.875-86.625 61.25-141.75-0.875-4.375 0-4.375 2.625-6.125 16.625-8.75 33.25-18.375 49-27.125 3.5-1.75 4.375-1.75 7 0.875 24.5 21.875 51.625 33.25 81.375 35 21.875 0.875 45.5-2.625 70.875-11.375 3.5-0.875 6.125-2.625 9.625-4.375 7-4.375 14-8.75 19.25-14l1.75-0.875c0.875-0.875 1.75-1.75 2.625-1.75s2.625-0.875 5.25 0.875c9.625 6.125 19.25 12.25 28 16.625l20.125 12.25c2.625 1.75 3.5 2.625 2.625 5.25-7 31.5-2.625 62.125 14.875 95.375s42 55.125 76.125 67.375c1.75 1.75 2.625 1.75 2.625 5.25z" />
                <path d="m385 163.62c-8.75-2.625-18.375-4.375-28-5.25-22.75-0.875-45.5 3.5-65.625 14.875-29.75 16.625-49.875 42.875-58.625 74.375s-3.5 65.625 13.125 94.5c20.125 34.125 56 56 96.25 58.625h7c20.125 0 41.125-5.25 59.5-14.875 56.875-32.375 78.75-103.25 49-161-14.875-29.75-41.125-51.625-72.625-61.25zm13.125 203c-16.625 8.75-35.875 13.125-54.25 12.25-32.375-1.75-62.125-20.125-78.75-48.125-14-23.625-18.375-50.75-11.375-77s24.5-47.25 48.125-61.25c14.875-7.875 31.5-12.25 48.125-12.25h6.125c7.875 0.875 15.75 1.75 22.75 4.375 26.25 7.875 47.25 26.25 59.5 50.75 24.5 46.375 7 105-40.25 131.25z" />
              </g>
            </SvgInfo>
          </InfoButton>
          <PostButton
            onClick={publicKey ? publishEvent : establishNostrKey}
            disabled={!editable}
          >
            {publicKey ? (editable ? 'Post comment' : 'Submitting') : 'Get Key'}
          </PostButton>
        </InputSectionRow2>
      </InputSection>

      {isInfoOpen && (
        <Info>
          Commenting{' '}
          {selfName !== '_' && (
            <>
              as <em style={{color: 'green'}}>{selfName}</em>
            </>
          )}{' '}
          using relays{' '}
          <ul>
            {relays.map(url => (
              <li key={url} style={{color: 'orange', paddingRight: '5px'}}>
                {url}
              </li>
            ))}
          </ul>
          <p>
            Powered by{' '}
            <a
              style={{
                marginTop: '4px',
                fontWeight: 'bold',
                color: 'var(--nc-primary-color)'
              }}
              target="_blank"
              href="https://github.com/fiatjaf/nocomment"
            >
              NoComment
            </a>
            .
          </p>
        </Info>
      )}

      {notices.map(notice => (
        <Notice key={notice.text}>{notice.text}</Notice>
      ))}

      <div>
        {threads.map(thread => (
          <Thread thread={thread} metadata={metadata} relays={relays} />
        ))}
      </div>
    </Container>
  )

  async function establishNostrKey() {
    // check if they have a nip07 nostr extension
    if (window.nostr) {
      try {
        // and if it has a key stored on it
        setPublicKey(await window.nostr.getPublicKey())
      } catch (err) {}
    } else {
      // otherwise use a key from localStorage or generate a new one
      let privateKey = localStorage.getItem('nostrkey')
      if (!privateKey || privateKey.match(/^[a-f0-9]{64}$/)) {
        privateKey = generatePrivateKey()
        localStorage.setItem('nostrkey', privateKey)
      }
      setPrivateKey(privateKey)
      setPublicKey(getPublicKey(privateKey))
    }
  }

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

  async function handleSettingsClick() {
    setIsInfoOpen(!isInfoOpen)
  }

  async function publishEvent() {
    setEditable(false)

    let root = baseEvent
    if (!root) {
      // create base event right here
      let sk = generatePrivateKey()
      let tags = [
        ['r', url],
      ];
      if (owner !== '') {
        tags.push(['p', owner])
      }
      root = {
        pubkey: getPublicKey(sk),
        created_at: Math.round(Date.now() / 1000),
        kind: 1,
        tags: tags,
        content: `Comments on ${url}` + (owner !== '' ? ` by #[1]` : '') + ` ↴`
      }
      root.id = getEventHash(root)
      root.sig = signEvent(root, sk)
      setBaseEvent(root)

      connections.current.forEach(conn => {
        conn.publish(root)
      })
    }

    console.log('base event: ', root)

    let event = {
      pubkey: publicKey,
      created_at: Math.round(Date.now() / 1000),
      kind: 1,
      tags: [['e', root.id, baseEventRelay.current || relays[0], 'root']],
      content: comment
    }

    console.log('event: ', event)

    // if we have a private key that means it was generated locally and we don't have a nip07 extension
    if (privateKey) {
      event.id = getEventHash(event)
      event.sig = signEvent(event, privateKey)
    } else {
      try {
        event = await window.nostr.signEvent(event)
      } catch (err) {
        showNotice(
          `window.nostr.signEvent() has returned an error: ${err.message}`
        )
        setEditable(true)
        return
      }
    }

    const publishTimeout = setTimeout(() => {
      showNotice(
        `failed to publish event ${event.id.slice(0, 5)}… to any relay.`
      )
      setEditable(true)
    }, 8000)

    console.log('publishing...')

    connections.current.forEach(conn => {
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
    setNotices(notices => [...notices, {time: Date.now(), text}])
    setTimeout(() => {
      setNotices(notices => notices.filter(n => n.time - Date.now() > 5000))
    }, 5050)
  }
}
