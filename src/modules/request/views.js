
const requestCallbackId = 'request';

const requestTypes = {
  activation: {
    label: 'Activation',
    value: 'activation',
    icon: ':recycle:'
  },
  hotfix: {
    label: 'Hotfix',
    value: 'hotfix',
    icon: ':fire:'
  }
}

const requestDialogView = (text) => ({
  title: 'Request a relesase',
  callback_id: requestCallbackId,
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


module.exports = {
  requestDialogView
}
