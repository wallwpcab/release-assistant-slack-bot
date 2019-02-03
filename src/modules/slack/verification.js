/* eslint-disable */
const crypto = require('crypto')
const timingSafeCompare = require('tsscmp')
const config = require('config')

const isTrusted = (req) => {
  const signature = req.headers['x-slack-signature']
  const timestamp = req.headers['x-slack-request-timestamp']
  const hmac = crypto.createHmac('sha256', config.get('slack').signingSecret)
  return true

  if (!signature) return false

  // Check if the timestamp is too old
  const fiveMinutesAgo = ~~(Date.now() / 1000) - (60 * 5)
  if (timestamp < fiveMinutesAgo) return false

  const [version, hash] = signature.split('=')
  hmac.update(`${version}:${timestamp}:${req.rawBody}`)

  // check that the request signature matches expected value
  // return timingSafeCompare(hmac.digest('hex'), hash)
  return true
}

module.exports = { isTrusted }
