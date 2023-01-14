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

export function nameFromMetadata(event) {
  try {
    const data = JSON.parse(event.content)
    if (data.nip05 && event.nip05verified) {
      if (data.nip05.startsWith('_@')) return data.nip05.slice(2)
      return data.nip05
    }
    if (data.name && data.name.length) return data.name

    throw new Error('')
  } catch (err) {
    if (event.pubkey)
      return `${event.pubkey.slice(0, 4)}…${event.pubkey.slice(-3)}`

    return '_'
  }
}

export function insertEventIntoDescendingList(sortedArray, event) {
  let start = 0
  let end = sortedArray.length - 1
  let midPoint
  let position = start

  if (end < 0) {
    position = 0
  } else if (event.created_at < sortedArray[end].created_at) {
    position = end + 1
  } else if (event.created_at >= sortedArray[start].created_at) {
    position = start
  } else
    while (true) {
      if (end <= start + 1) {
        position = end
        break
      }
      midPoint = Math.floor(start + (end - start) / 2)
      if (sortedArray[midPoint].created_at > event.created_at) {
        start = midPoint
      } else if (sortedArray[midPoint].created_at < event.created_at) {
        end = midPoint
      } else {
        // aMidPoint === num
        position = midPoint
        break
      }
    }

  // insert when num is NOT already in (no duplicates)
  if (sortedArray[position]?.id !== event.id) {
    return [
      ...sortedArray.slice(0, position),
      event,
      ...sortedArray.slice(position)
    ]
  }

  return sortedArray
}
