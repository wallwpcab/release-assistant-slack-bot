const eventRequestGenerator = (subtype, channel) => props => {
  return {
    body: {
      event: {
        type: 'message',
        subtype,
        channel,
        ...props
      }
    }
  }
}

module.exports = {
  eventRequestGenerator
}
