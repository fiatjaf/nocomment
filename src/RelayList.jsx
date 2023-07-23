import React, {useState} from 'react'
import {Info, GhostButton, DangerText} from './components'

export const RelayList = ({setRelays, relays, selfName}) => {
  const [r, setR] = useState('')
  return (
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
            <GhostButton
              type="button"
              aria-label="Remove"
              onClick={() => setRelays(relays.filter(r => r !== url))}
            >
              <DangerText>&times;</DangerText>
            </GhostButton>
          </li>
        ))}
        <li>
          <form
            onSubmit={e => {
              e.preventDefault()
              if (!r) {
                return
              }
              const u = /wss?:\/\//.test(r) ? r : `wss://${r}`
              setRelays(relays.filter(a => a !== u).concat(u))
              setR('')
            }}
          >
            <input
              placeholder="wss://relay.url"
              type="text"
              value={r}
              onChange={e => setR(e.target.value)}
            />
            <GhostButton type="submit">Add relay</GhostButton>
          </form>
        </li>
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
  )
}
