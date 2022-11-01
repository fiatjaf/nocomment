# nostr-comments-widget-react

This is an embeddable nostr comments widget that "just works".

Try it out at [nostr-comments-widget-react.vercel.app](https://nostr-comments-widget-react.vercel.app/) or add it to your own site:

## Demo/Sample

## Installation

1. **npm install nostr-comments-widget-react**
2. Don't create an account anywhere
3. Don't configure a database
4. It just works. You now have a chat about your website. The url is the identifier.

## Usage
```
import { NostrComments } from 'nostr-comments-widget-react'
import 'nostr-comments-widget-react/lib/index.css'

function App() {
  return (
    ...
      <NostrComments relays={[
        'wss://nostr.drss.io',
        'wss://nostr-relay.freeberty.net',
        'wss://nostr.unknown.place',
        'wss://nostr-relay.untethr.me',
        'wss://relay.damus.io'
      ]} />
    ...
  );
}
```

## Customization
The widget can be styled by the following CSS variables
```
  --nostr-comments-background - Background color
  --nostr-comments-text-color - Text color
  --nostr-comments-text-color-dark - Pubic key color
  --nostr-comments-primary-color - Button BG color
  --nostr-comments-primary-contrast - Button text color
```

### Default:
```
  --nostr-comments-background: white
  --nostr-comments-text-color: #888
  --nostr-comments-text-color-dark: #222
  --nostr-comments-primary-color: #0d6efd
  --nostr-comments-primary-contrast: white
```
  
## Roadmap
 - User key generation / import, followed by profile setup (Name and avatar)
 - More styles
 - Comments pagination
 - [Demand based] Nested comments
 - [Demand based] Markdown
 - [Long shot] Pay sats to comment via Lightning integration

## Warnings
* All messages are public even if your website is not
* All messages contain the URL of your website, so especially if that URL contains sensitive information, this widget should **not be used in its current form**!
* This software is experimental. Use at your own risk.

If you want to learn more about nostr, check out [awesome-nostr](https://github.com/aljazceru/awesome-nostr).
