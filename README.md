# nocomment

This is an embeddable comments widget that "just works".
Try it out at https://nocomment.netlify.app/ or add it to your own site

## Screenshots

1. Default styling:

![Default styling](screenshot-1.png)

2. Custom CSS variables for styling:

```
--nc-background: #003049;
--nc-text-background: #dddddd;
--nc-text-color: #eae2b7;
--nc-text-color-dark: #fcbf49;
--nc-primary-color: #fcbf49;
--nc-primary-contrast: #003049;
```

![Custom styling](screenshot-2.png)

## Usage as an embeddable script

Anywhere in your website you want to see the comment box, include

```
<script src="https://nocomment.netlify.app/embed.js" id="nocomment"></script>
```

## Usage as a React component

1. `npm install nocomment`
2. Don't create an account anywhere.
3. Don't configure a database.
4. It just works. The URL is the identifier.

```
import { NoComment } from 'nocomment'

function App() {
  return (
    ...
      <NoComment relays={[
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

## License

Public domain.
