export function normalizeURL(raw) {
  let url = new URL(raw)
  return (
    url.origin
      .replace('://m.', '://') // remove known 'mobile' subdomains
      .replace('://mobile.', '://')
      .replace('http://', 'https://') // default everything to https (maybe a terrible idea)
      .replace(
        /:\d+/,
        // remove 443 and 80 ports
        port => (port === ':443' || port === ':80' ? '' : port)
      ) +
    url.pathname
      .replace(/\/+/g, '/') // remove duplicated slashes in the middle of the path
      .replace(/\/*$/, '') // remove slashes from the end of path
  )
}
