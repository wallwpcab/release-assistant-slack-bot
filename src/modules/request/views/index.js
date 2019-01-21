const initiatedViews = require('./initiated')
const rejectedViews = require('./rejected')
const { requestIdLabel, typeLabel, commitsLabel, requestLabel, usersLabel } = require('./labels')
const { requestMapping, approvalMapping, requestTypes } = require('../mappings')

const requestFormView = (text) => ({
  title: 'Request a relesase',
  callback_id: requestMapping.callback_id,
  submit_label: 'Submit',
  elements: [
    {
      label: 'Type',
      name: 'requestType',
      type: 'select',
      hint: 'Choose release type',
      options: Object.values(requestTypes).map(({ label, value }) => ({ label, value })),
      value: 'hotfix'
    },
    {
      label: 'Commits',
      name: 'commits',
      type: 'textarea',
      placeholder: '3ffbe01162a, 1eec6e982e0',
      hint: 'Put space/comma separated SHA commit ids',
      value: 'SHA1 SHA2'
    },
    {
      label: 'Description',
      type: 'textarea',
      name: 'description',
      optional: true,
      placeholder: 'JIRA ticket link',
      hint: 'Put description, JIRA ticket link',
      value: 'Request description'
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
      hint: 'Mention if you got aprovals already'
    },
    {
      label: 'Subscribers',
      type: 'text',
      name: 'subscribers',
      value: text,
      optional: true,
      hint: "Please dont make any change here! Use '/request-release' arguments."
    }
  ]
})

const requestReceivedAuthorView = ({ id, type, commits, subscribers, file }) => ({
  response_type: 'ephemeral',
  text: `I've received your ${typeLabel(type)} request with following commits: ${commitsLabel(commits)} Your request id is: ${requestIdLabel(id, file.link)}.\nI'll notify ${usersLabel(subscribers)} about further updates.`,
  mrkdwn: true,
  mrkdwn_in: ['text'],
})

const requestReceivedManagerView = (requestData) => {
  const { callback_id, initiate, reject } = approvalMapping
  return {
    text: `You've got following release request.\n ${requestLabel(requestData)}`,
    attachments: [
      {
        text: "Do you like to proceed?",
        fallback: "You've got a release request. Please check.",
        callback_id,
        color: "#3AA3E3",
        attachment_type: "default",
        actions: [
          {
            name: initiate,
            text: "Yes",
            type: "button",
            style: "primary",
            value: requestData.id
          },
          {
            name: reject,
            text: "No",
            type: "button",
            style: "danger",
            value: requestData.id,
            confirm: {
              title: "Are you sure?",
              text: "Wouldn't you like to proceed?",
              ok_text: "Yes",
              dismiss_text: "No"
            }
          }
        ]
      }
    ]
  }
}

const requestInvalidIdView = (id) => {
  return {
    response_type: 'ephemeral',
    text: `Request *\`${id}\`* is invalid`
  }
}

const requestAlreadyInitiatedView = (requestData) => {
  const { id, file, initiator } = requestData
  return {
    response_type: 'ephemeral',
    text: `<@${initiator.id}> already initiated ${requestIdLabel(id, file.link)} release request.`
  }
}

module.exports = {
  requestFormView,
  requestReceivedAuthorView,
  requestReceivedManagerView,
  requestInvalidIdView,
  requestAlreadyInitiatedView,
  ...initiatedViews,
  ...rejectedViews
}
