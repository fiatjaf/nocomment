# nocomment

A Nostr-powered embeddable website comments widget that _just works_.

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

You can pass special attributes to that `<script>` tag, such as

- `data-relays='["wss://my.custom.relay", "..."]'`, a JSON list of relay URLs to use instead of the default ones;
- `data-skip="/"`, a path of your website to skip rendering the widgets in. The default is `"/"`.

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
