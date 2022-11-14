import React from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
import {nameFromMetadata, pictureFromMetadata} from './util'

export function NostrCommentsItem({evt, metadata}) {

  return (
    <div className='nostr-comments-8015-comment-card'>
      <div>
        <img src={pictureFromMetadata(metadata[evt.pubkey] || {pubkey: evt.pubkey})} className="nostr-comments-8015-avatar-image" />
      </div>
      <div>
        <div style={{ fontFamily: 'monospace', paddingTop: '6px' }}>
            <span className='nostr-comments-8015-comment-title'> <b> {nameFromMetadata(metadata[evt.pubkey] || {pubkey: evt.pubkey})} </b> </span>
            <span style={{ fontFamily: 'arial', fontSize: '0.7em' }}>
                { dayjs(evt.created_at * 1000).from(new Date()) }
            </span>
        </div>
        <div style={{ marginTop: '4px', fontSize: '0.9em' }}>{evt.content}</div>
      </div>
    </div>
  );
}
