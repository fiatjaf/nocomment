import React, {useState} from 'react'
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
  CommentContent,
  ReplyWrap
} from './components'
import {getName, getImage} from './util'
import ReplyButton from './ReplyButton'

export default function Thread({
  thread,
  metadata,
  relays,
  replyForm,
  level = 0
}) {
  const [expanded, setExpanded] = useState(false)
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
              <CommentAuthorImage
                src={getImage(metadata, thread.pubkey)}
                aria-label="comment author image"
              />
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
        <ReplyButton onClick={() => setExpanded(!expanded)} />
      </div>
      <CommentContent>{thread.content}</CommentContent>
      {expanded && <ReplyWrap>{replyForm(thread.id)}</ReplyWrap>}
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
            replyForm={replyForm}
          />
        ))}
      </div>
    </CommentCard>
  )
}

export function computeThreads(baseTag, events) {
  let threadableEvents = events.map(event => ({...event, replies: []}))

  let threads = []
  for (let i = threadableEvents.length - 1; i >= 0; i--) {
    let event = threadableEvents[i]
    let reply = getImmediateReply(event.tags)

    // if this is not a reply to another comment we assume it is a reply
    // to the "root"/base -- i.e. a top-level comment
    if (!reply || reply === baseTag.ref) {
      threads.unshift(event)
      continue
    }

    let parent = getEvent(reply)
    parent.replies.unshift(event)
  }

  return threads

  function getImmediateReply(tags) {
    let curr = null
    for (let t = tags.length - 1; t >= 0; t--) {
      let tag = tags[t]
      if (
        (tag[0] === 'a' || tag[0] === 'e') &&
        typeof tag[1] === 'string' &&
        // can't be root in this context because the root
        //   is always the original website event
        tag[3] !== 'root'
      ) {
        if (tag[3] === 'reply') {
          return tag[1]
        }

        // use the last "e" tag if none are marked as "reply"
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
