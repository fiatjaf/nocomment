import React from 'react'

export function NostrCommentsLoader({text}) {

  return <div className='nostr-comments-8015-input-section'>
    <div className='nostr-comments-8015-input-section-button-row'>

        <button className='nostr-comments-8015-post-button' disabled>
          { text }
        </button>

    </div>
  </div>

}


