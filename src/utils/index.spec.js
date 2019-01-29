const {
  splitValues,
  getSlackChannelTags,
  getSlackChannel,
  getSlackUserTags,
  getSlackUser,
  updateObject
} = require('./index')

describe('Utils', () => {
  it('Can split text by white space or comma seperator', () => {
    expect(splitValues('123 456 \n 6778 , 5666, , 90')).toEqual(['123', '456', '6778', '5666', '90'])
  })

  it('Can extract Slack channels from text', () => {
    expect(getSlackChannelTags('bla bla <#CHANNEL1> <#CHANNEL2|channel2>, bla <#CHANNEL3|channel3> test')).toEqual(['<#CHANNEL1>', '<#CHANNEL2|channel2>', '<#CHANNEL3|channel3>'])
  })

  it('Can extract Slack channel id from text', () => {
    expect(getSlackChannel('bla bla <#CHANNEL1|channel1>')).toEqual({
      id: 'CHANNEL1',
      name: 'channel1'
    })
  })

  it('Can extract Slack users from text', () => {
    expect(getSlackUserTags('bla bla <@USER1> <@USER2|user2>, bla <@USER3|user3> test')).toEqual(['<@USER1>', '<@USER2|user2>', '<@USER3|user3>'])
  })

  it('Can extract Slack userId from text', () => {
    expect(getSlackUser('bla bla <@USER1|user1> abc')).toEqual({
      id: 'USER1',
      name: 'user1'
    })
  })

  it('Can update child object', () => {
    const child = {
      id: '1',
      b: 'b'
    }
    const parent = {
      '1': {
        id: '1',
        a: 'a'
      }
    }

    expect(updateObject(parent, child, 'id')).toMatchObject({
      ...parent,
      [child.id]: child
    })
  })
})
