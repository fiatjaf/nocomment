import React, {useState, useEffect, useRef, useMemo} from 'react'
import {useDebounce} from 'use-debounce'
import {SimplePool} from 'nostr-tools/pool'
import * as nip05 from 'nostr-tools/nip05'
import * as nip19 from 'nostr-tools/nip19'

import {normalizeURL, insertEventIntoDescendingList, getName} from './util'
import {Container} from './components'
import Thread, {computeThreads} from './Thread'
import {Editor} from './Editor'
import {RelayList} from './RelayList'

export function NoComment({
  url = normalizeURL(location.href),
  relays = [],
  owner,
  skip,
  customBase,
  placeholder,
  readonly
}) {
  let customBaseTag = useMemo(() => {
    if (customBase) {
      let id = null
      let address = null
      let relay = ''
      try {
        let {type, data} = nip19.decode(customBase)
        if (type === 'naddr') {
          address = `${data.kind}:${data.pubkey}:${data.identifier}`
        } else {
          id = data.id ?? data
        }
        relay = data.relays?.[0] ?? ''
      } catch (err) {
        id = customBase
      }

      if (address) {
        return {
          ref: address,
          filters: [
            {
              '#a': [address],
              kinds: [1]
            }
          ],
          rootReference: [['a', address, relay, 'root']]
        }
      }
      return {
        ref: id,
        filters: [
          {
            '#e': [id],
            kinds: [1]
          }
        ],
        rootReference: [['e', id, relay, 'root']]
      }
    }
  }, [customBase])

  let ownerTag = null
  if (owner) {
    try {
      let {type, data} = nip19.decode(ownerTag)
      switch (type) {
        case 'npub':
          ownerTag = ['p', data]
          break
        case 'nprofile':
          ownerTag = ['p', data.pubkey]
          if (data.relays.length > 0) {
            ownerTag.push(data.relays[0])
          }
          break
      }
    } catch (err) {
      if (owner.match(/^[a-f0-9]{64}$/)) {
        ownerTag = ['p', owner]
      }
    }
  }

  const [baseTagImmediate, setBaseTag] = useState(customBaseTag)
  const [publicKey, setPublicKey] = useState(null)
  const [eventsImmediate, setEvents] = useState([])
  const [metadata, setMetadata] = useState({})
  const metadataFetching = useRef({})
  const pool = useRef(new SimplePool())
  const [baseTag] = useDebounce(baseTagImmediate, 1000)
  const [events] = useDebounce(eventsImmediate, 1000, {leading: true})
  const threads = useMemo(() => {
    if (!baseTag) return
    return computeThreads(baseTag, events)
  }, [baseTag, events])
  const [privateKey, setPrivateKey] = useState(null)
  const [chosenRelays, setChosenRelays] = useState(relays)

  useEffect(() => {
    if (baseTag) return

    // search for the base event based on the #r tag (url)
    pool.current.trackRelays = true
    pool.current
      .querySync(chosenRelays, {
        '#r': [url],
        kinds: [1]
      })
      .then(events => {
        if (events.length === 0) return

        setBaseTag({
          filters: [
            {
              '#e': events.slice(0, 3).map(event => event.id),
              kinds: [1]
            }
          ],
          rootReference: [
            [
              'e',
              events[0].id,
              Array.from(pool.current.seenOn.get(events[0].id))[0].url,
              'root'
            ]
          ]
        })
      })
      .finally(() => {
        pool.current.trackRelays = false
      })
  }, [chosenRelays.length])

  useEffect(() => {
    if (!baseTag) return

    // query for comments
    let sub = pool.current.subscribeMany(chosenRelays, baseTag.filters, {
      onevent(event) {
        setEvents(events => insertEventIntoDescendingList(events, event))
        fetchMetadata(event.pubkey, i)
        i++
      }
    })

    let i = 0

    return () => {
      sub.close()
    }
  }, [baseTag, chosenRelays.length])

  if (skip && skip !== '' && skip === location.pathname) {
    return
  }

  return (
    <Container>
      {!readonly && editor()}

      <div>
        {threads?.map(thread => (
          <Thread
            key={thread.id}
            thread={thread}
            metadata={metadata}
            relays={chosenRelays}
            replyForm={editor}
            readonly={readonly}
          />
        ))}
      </div>
    </Container>
  )

  function editor(parentId) {
    let selfName = getName(metadata, publicKey)
    return (
      <Editor
        publicKey={publicKey}
        setPublicKey={setPublicKey}
        privateKey={privateKey}
        setPrivateKey={setPrivateKey}
        baseTag={baseTag}
        ownerTag={ownerTag}
        url={url}
        setBaseTag={setBaseTag}
        pool={pool}
        parentId={parentId}
        relays={chosenRelays}
        placeholder={placeholder}
        settingsContent={
          <RelayList
            selfName={selfName}
            relays={chosenRelays}
            setRelays={setChosenRelays}
          />
        }
      />
    )
  }

  async function fetchMetadata(pubkey, delay = 0) {
    if (pubkey in metadata) return
    if (pubkey in metadataFetching.current) return
    metadataFetching.current[pubkey] = true
    await new Promise(resolve => setTimeout(resolve, delay * 200))

    let done = 0

    let sub = pool.current.subscribeMany(chosenRelays, [{kinds: [0], authors: [pubkey]}],
      {
        onevent(event) {
          if (!metadata[pubkey] || metadata[pubkey].created_at < event.created_at) {
            setMetadata(curr => {
              try {
                return {
                  ...curr,
                  [pubkey]: {
                    ...JSON.parse(event.content),
                    created_at: event.created_at
                  }
                }
              } catch {
                return curr
              }
            })
          }
        },
        oneose() {
          sub.close()
          done--
    
          if (done === 0) fetchNIP05(pubkey, metadata[pubkey])
        }
      }
    )
    done++
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
}
