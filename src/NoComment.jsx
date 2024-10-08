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

  const [baseTagImmediate, setBaseTag] = useState(null)
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
    if (customBase) {
      let id = null
      let address = null
      let filter = null
      let relay = ''
      try {
        let {type, data} = nip19.decode(customBase)
        if (type === 'naddr') {
          address = `${data.kind}:${data.pubkey}:${data.identifier}`
          filter = {kinds: [data.kind], authors: [data.pubkey], "#d": [data.identifier]}
        } else {
          id = data.id ?? data
          filter = {ids: [id]}
        }
        relay = data.relays?.[0] ?? ''
      } catch (err) {
        id = customBase
        filter = {ids: [id]}
      }

      pool.current.trackRelays = true
      pool.current.get(relays, filter)
        .then(event => {
          relay = relay || Array.from(pool.current.seenOn.get(event.id))[0].url

          if (address) {
            setBaseTag({
              ref: address,
              filters: [
                {'#a': [address], kinds: [1]},
                {'#A': [address], kinds: [1111]}
              ],
              rootReference: [
                ['A', address, relay],
                ['K', event.kind.toString()]
              ],
              parentReference: [
                ['a', address, relay],
                ['e', event.id, relay],
                ['k', event.kind.toString()],
                ['p', event.pubkey]
              ]
            })
          } else {
            setBaseTag({
              ref: id,
              filters: [
                {'#e': [id], kinds: [1]},
                {'#E': [id], kinds: [1111]}
              ],
              rootReference: [
                ['E', id, relay, event.pubkey],
                ['K', event.kind.toString()]
              ],
              parentReference: [
                ['e', id, relay, event.pubkey],
                ['k', event.kind.toString()],
                ['p', event.pubkey]
              ]
            })
          }
        })
        .finally(() => {
          pool.current.trackRelays = false
        })
    }
  }, [customBase])

  useEffect(() => {
    if (customBase) return

    // search for the base event based on the #r tag (url)
    pool.current.trackRelays = true
    pool.current
      .querySync(chosenRelays, {
        '#r': [url],
        kinds: [1]
      })
      .then(events => {
        let filters = [{'#I': [url], kinds: [1111]}]
        if (events.length !== 0) {
          filters.push({
            '#e': events.slice(0, 3).map(event => event.id),
            kinds: [1]
          })
        }

        let urlObj = new URL(url)
        let domain = `${urlObj.protocol}//${urlObj.host}`
        let parentReference = [
          ['i', url],
          ['k', domain]
        ]
        if (ownerTag) {
          parentReference.push(ownerTag)
        }

        setBaseTag({
          filters,
          rootReference: [
            ['I', url],
            ['K', domain]
          ],
          parentReference
        })
      })
      .finally(() => {
        pool.current.trackRelays = false
      })
  }, [chosenRelays.length])

  useEffect(() => {
    if (!baseTag) return

    // query for comments
    pool.current.trackRelays = true
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
      pool.current.trackRelays = false
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

  function editor(parent) {
    let selfName = getName(metadata, publicKey)
    return (
      <Editor
        publicKey={publicKey}
        setPublicKey={setPublicKey}
        privateKey={privateKey}
        setPrivateKey={setPrivateKey}
        baseTag={baseTag}
        pool={pool}
        parent={parent}
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
