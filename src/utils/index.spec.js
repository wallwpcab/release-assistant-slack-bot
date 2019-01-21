const {
  splitValues,
  extractSlackChannels,
  extractSlackChannelId,
  extractSlackUsers,
  extractSlackUserId
} = require('./index')

describe('Utils', () => {
  it('Can split text by white space or comma seperator', () => {
    expect(splitValues('123 456 \n 6778 , 5666, , 90')).toEqual(['123', '456', '6778', '5666', '90'])
  })

  it('Can extract Slack channels from text', () => {
    expect(extractSlackChannels('bla bla <#CHANNEL1> <#CHANNEL2|channel2>, bla <#CHANNEL3|channel3> test')).toEqual(['<#CHANNEL1>', '<#CHANNEL2|channel2>', '<#CHANNEL3|channel3>'])
  })

  it('Can extract Slack channel id from text', () => {
    expect(extractSlackChannelId('bla bla <#CHANNEL1>')).toEqual('CHANNEL1')
  })

  it('Can extract Slack users from text', () => {
    expect(extractSlackUsers('bla bla <@USER1> <@USER2|user2>, bla <@USER3|user3> test')).toEqual(['<@USER1>', '<@USER2|user2>', '<@USER3|user3>'])
  })

  it('Can extract Slack userId from text', () => {
    expect(extractSlackUserId('bla bla <@USER1> abc')).toEqual('USER1')
  })
})
