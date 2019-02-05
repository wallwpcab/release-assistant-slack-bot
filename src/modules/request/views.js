const { Request, RequestType } = require('./mappings')
const { requestIdLabel } = require('./labels')
const { slackUserTag } = require('../../utils')

const requestFormView = () => ({
  title: 'Request a relesase',
  callback_id: Request.callback_id,
  submit_label: 'Submit',
  elements: [
    {
      label: 'Type',
      name: 'requestType',
      type: 'select',
      hint: 'Choose a release type',
      options: Object.values(RequestType).map(({ label, value }) => ({ label, value })),
      value: 'activation'
    },
    {
      label: 'Commits',
      name: 'commits',
      type: 'textarea',
      placeholder: '3ffbe01162a, 1eec6e982e0',
      hint: 'Put space/comma separated SHA commit ids',
      value: '3ffbe01162a, 1eec6e982e0'
    },
    {
      label: 'Description',
      type: 'textarea',
      name: 'description',
      optional: true,
      placeholder: 'JIRA ticket link',
      hint: 'Put description, JIRA ticket link',
      value: 'No description'
    },
    {
      label: 'Has approval?',
      name: 'approval',
      optional: true,
      type: 'select',
      options: [
        {
          label: 'Yes',
          value: 'yes'
        },
        {
          label: 'No',
          value: 'no'
        }
      ],
      hint: 'Mention if you got aprovals already',
      value: 'no'
    }
  ]
})

const requestInvalidIdView = id => ({
  response_type: 'ephemeral',
  text: `Request *\`${id}\`* is invalid`
})

const requestAlreadyInitiatedView = (request) => {
  const { approver } = request
  return {
    response_type: 'ephemeral',
    text: `${slackUserTag(approver)} already initiated ${requestIdLabel(request)} release request.`
  }
}

module.exports = {
  requestFormView,
  requestInvalidIdView,
  requestAlreadyInitiatedView
}
