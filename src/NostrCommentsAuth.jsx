import React, {useState} from 'react'

export function NostrAuthReducer(state, action) {
  console.log('NostrAuthReducer: ', action.type)

  switch (action.type) {

    case 'loading':
      return 'loading'

    case 'noNip07':
      return 'noNip07'

    case 'noPubkey':
      return 'noPubkey'

    case 'public_key_received':
      const pubkey = action.pubkey
      if (action.metadata[pubkey] && action.metadata[pubkey].profile) {
        const profile = action.metadata[pubkey].profile;
        if (profile.name && profile.about && profile.picture) {
          return 'allSet'
        } else {
          return 'noProfile'
        }
      } else {
        return 'noProfile'
      }

    case 'self_meta_received':
      const evt = action.event
      if (evt.profile.name && evt.profile.about && evt.profile.picture) {
        return 'allSet'
      } else {
        return 'noProfile'
      }

    case 'meta_saved':
      return 'allSet'

    default:
      throw new Error();
  }

}

export function NostrCommentsNoNip07() {

  return <div className='nostr-comments-8015-no-nip07'>
    <p>
      <b>Nip07 support required to comment.</b> <br/> 1. Install nos2x extention. <br/> 2. Configure a private key. <br/> 3. Refresh this page.
    </p>

    <div className='nostr-comments-8015-input-section-button-row'>

        <div> Step 1 / 3 </div>
        <a href='https://addons.mozilla.org/en-US/firefox/addon/nos2x/' target='_blank' className='nostr-comments-8015-post-button' style={{ textDecoration: 'none' }}>
          for Firefox
        </a>

        <a href='https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp/related' target='_blank' className='nostr-comments-8015-post-button' style={{ textDecoration: 'none' }}>
          for Chrome
        </a>
    </div>
  </div>

}

export function NostrCommentsNoPubkey({ onGetKey }) {

  
  function onGetKeyEvent() {
    onGetKey();
  }

  return <div className='nostr-comments-8015-input-section'>
    <div className='nostr-comments-8015-input-section-button-row'>

        <div> Step 2 / 3 </div>
        <button className='nostr-comments-8015-post-button' onClick={onGetKeyEvent}>
          Get Public key
        </button>

    </div>
  </div>

}

export function NostrCommentsCreateProfile({ onSubmit }) {

  const [userName, setUserName] = useState('')
  const [profilePicUrl, setProfilePicUrl] = useState('')
  const [about, setAbout] = useState('')

  function createProfileEvent(ev) {
    console.log(userName, profilePicUrl)
    onSubmit({ userName, about, profilePicUrl });
  }

  return (
    <div className='nostr-comments-8015-input-section'>
        <div className="nostr-comments-8015-form-group">
          <label htmlFor='username'> Username </label>
          <input type='text' id='username' value={userName} onChange={e => setUserName(e.target.value) } />
        </div>

        <div className="nostr-comments-8015-form-group">
          <label htmlFor='profilePic'> Profile pic url </label>
          <input type='text' id='profilePic' value={profilePicUrl} onChange={e => setProfilePicUrl(e.target.value) } />
        </div>

        <div className="nostr-comments-8015-form-group">
          <label htmlFor='about'> About you </label>
          <input type='text' id='about' value={about} onChange={e => setAbout(e.target.value) } />
        </div>

        <div className='nostr-comments-8015-input-section-button-row'>

            <div> Step 3 / 3 </div>
            <button className='nostr-comments-8015-post-button' onClick={createProfileEvent}>
              Create profile
            </button>

        </div>
    </div>
  )
}
