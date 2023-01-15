import React from 'react'
import {nip19} from 'nostr-tools'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import {
  CommentCard,
  CommentTitle,
  CommentAuthor,
  CommentAuthorImage,
  CommentDate,
  CommentContent
} from './components'
import {getName, getImage} from './util'

export default function Thread({thread, metadata, relays, level = 0}) {
  return (
    <CommentCard key={thread.id}>
      <div>
        <CommentTitle>
          from{' '}
          <CommentAuthor
            target="_blank"
            href={'nostr:' + nip19.npubEncode(thread.pubkey)}
          >
            {getImage(metadata, thread.pubkey) && (
              <CommentAuthorImage src={getImage(metadata, thread.pubkey)} />
            )}
            {getName(metadata, thread.pubkey)}
          </CommentAuthor>{' '}
        </CommentTitle>
        <CommentDate
          target="_blank"
          href={'nostr:' + nip19.neventEncode({id: thread.id, relays})}
        >
          {dayjs(thread.created_at * 1000).from(new Date())}
        </CommentDate>
      </div>
      <CommentContent>{thread.content}</CommentContent>
      <div
        style={{
          paddingLeft: `${36 - 6 * Math.pow(1.2, level)}px`
        }}
      >
        {thread.replies.map(subthread => (
          <Thread
            key={subthread.id}
            thread={subthread}
            metadata={metadata}
            relays={relays}
            level={level + 1}
          />
        ))}
      </div>
    </CommentCard>
  )
}

export function computeThreads(events) {
  let threadableEvents = events.map(event => ({...event, replies: []}))

  let threads = []
  for (let i = threadableEvents.length - 1; i >= 0; i--) {
    let event = threadableEvents[i]
    let reply = getImmediateReply(event.tags)
    if (!reply) {
      threads.unshift(event)
      continue
    }

    let parent = getEvent(reply)
    parent.replies.unshift(event)
  }

  console.log(threads)
  return threads

  function getImmediateReply(tags) {
    let curr = null
    for (let t = tags.length - 1; t >= 0; t--) {
      let tag = tags[t]
      if (
        tag[0] === 'e' &&
        typeof tag[1] === 'string' &&
        // can't be root in this context because the root is always the original website event
        tag[3] !== 'root'
      ) {
        if (tag[3] === 'reply') {
          return tag[1]
        }

        if (curr === null) curr = tag[1]
      }
    }
    return curr
  }

  function getEvent(id) {
    for (let j = 0; j < threadableEvents.length; j++) {
      if (threadableEvents[j].id === id) return threadableEvents[j]
    }

    // couldn't find this event, so manufacture one
    let fake = {id, replies: []}
    threadableEvents.push(fake)

    return fake
  }
}
