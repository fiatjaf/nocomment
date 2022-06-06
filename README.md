# nostr-comments-widget-react

This is an embeddable nostr client that "just works".

Try it out at [nostr-comments-widget-react.vercel.app](https://nostr-comments-widget-react.vercel.app/) or add it to your own site:

1. Add this to your website where you want to see the chat: `<div id="comment-widget"></div><script type="text/javascript" src="https://nostr-comments-widget-react.vercel.app/main.build.js"></script>`
2. Don't create an account anywhere
3. Don't configure a database
4. It just works. You now have a chat about your website. The url is the identifier.

## Warnings

* Host `main.build.js` yourself, so you don't depend on that other server
* Better yet, bundle `main.build.js` yourself from the source code here
* All messages are public even if your website is not
* All messages contain the URL of your website, so especially if that URL contains sensitive information, this widget should **not be used in its current form**!
* This software is experimental. Use at your own risk.

If you want to learn more about nostr, check out [awesome-nostr](https://github.com/aljazceru/awesome-nostr).
