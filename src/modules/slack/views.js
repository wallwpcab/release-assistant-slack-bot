
const requestCallbackId = 'request';
const configCallbackId = 'config';
const approval = {
  callback_id: 'aproval',
  proceed: 'proceed',
  reject: 'reject'
}

const cancelRequest = {
  callback_id: 'cancelRequest',
  yes: 'yes',
  no: 'no'
}

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

const typeLabel = (type) => {
  const { label, icon } = requestTypes[type];
  return `*\`${label}\`* ${icon}`;
}

const commitsLabel = (commits) => {
  return `\`\`\`${commits.join(',\n')}\`\`\``;
}

const descriptionLabel = (desc) => {
  return `\`\`\`${desc}\`\`\``;
}

const requestIdLabel = (id, fileLink) => fileLink ? `*<${fileLink}|\`${id}\`>*` : `*\`${id}\`*`;

const usersLabel = (users) => {
  const quotedUsers = users.map(u => `${u}`)
  const firstButLastUsers = quotedUsers.slice(0, -1).join(', ');
  const [lastUser = ''] = quotedUsers.slice(-1);
  const otherUsers = (firstButLastUsers && ', ' + firstButLastUsers) + (lastUser && ` and ${lastUser}`)
  return `you${otherUsers}`;
}

const subscribersLabel = (subscribers) => {
  const users = subscribers.map(u => `${u}`).join(' ');
  return users && `//cc ${users}`;
}

const requestConfirmView = ({ id, type, commits, subscribers, fileLink }) => ({
  response_type: 'ephemeral',
  text: `I've received your ${typeLabel(type)} request with following commits: ${commitsLabel(commits)} Your request id is: ${requestIdLabel(id, fileLink)}.\nI'll notify ${usersLabel(subscribers)} about further updates.`,
  mrkdwn: true,
  mrkdwn_in: ['text'],
});

const configReadView = (store) => ({
  response_type: 'ephemeral',
  text: `Config: \`\`\`${JSON.stringify(store, null, 2)}\`\`\``,
  mrkdwn: true,
  mrkdwn_in: ['text'],
});

const configDialogView = (value) => ({
  title: 'Set config',
  callback_id: configCallbackId,
  submit_label: 'Submit',
  elements: [
    {
      label: 'Config',
      name: 'config',
      type: 'textarea',
      value
    }
  ]
});

const approvalLabel = (aproval) => {
  return aproval ? '*`YES`*' : '*`NO`*'
}

const requestLabel = ({
  id,
  type,
  commits,
  description,
  approval,
  fileLink,
  user
}) => {
  return `
Id:\t\t\t\t${requestIdLabel(id, fileLink)}
Author:\t\t<@${user.id}>
Type:\t\t\t${typeLabel(type)}
Approval:\t${approvalLabel(approval)}
Description: ${descriptionLabel(description)}
Commits: ${commitsLabel(commits)}
`
}

const requestApprovalView = (requestData) => {
  const { callback_id, proceed, reject } = approval;
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
            name: proceed,
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

const getTodayDate = (sep = '.') => {
  const date = new Date();
  return `${date.getDate()}${sep}${date.getMonth()}${sep}${date.getFullYear()}`
}

const gitCheckoutLabel = ({ id, type, baseCommit }) => {
  const commit = baseCommit || '__COMMIT_SHA__'
  return `git checkout -b release/${type}/${getTodayDate('')}/${id} ${commit}`;
}

const gitCherryPickLabel = (requests) => {
  const commits = Object.values(requests)
    .filter(r => !r.progress)
    .map(r => r.commits)
    .reduce((acc, r) => acc.concat(r), [])

  return commits.map(c => `git cherry-pick -x ${c}`).join('\n');
}

const proceedRequestManagerView = (requests, requestData, approver) => {
  const { id, type, fileLink } = requestData;
  return {
    text: `
<@${approver.id}> approved ${requestIdLabel(id, fileLink)} request.
Please follow these steps:
\`\`\`
# Checkout the new brance from ${type === 'activation' ? 'Staging' : 'Production'}
${gitCheckoutLabel(requestData)}

# Cherry pick
${gitCherryPickLabel(requests)}

# Push
git push origin HEAD
\`\`\``
  }
}

const proceedRequestChannelView = (requestData, approver) => {
  const { id, fileLink, user, subscribers } = requestData;
  return {
    text: `
<@${approver.id}> initiated ${requestIdLabel(id, fileLink)} release request of <@${user.id}>.  :tada:
${subscribersLabel(subscribers)}
`
  }
}

const proceedRequestAuthorView = (requestData, approver) => {
  const { id, fileLink } = requestData;
  return {
    text: `<@${approver.id}> initiated your ${requestIdLabel(id, fileLink)} release request.  :tada:`
  }
}

const proceedRequestAlreadyInitiatedView = (requestData) => {
  const { id, fileLink, initiator } = requestData;
  return {
    text: `<@${initiator.id}> already initiated ${requestIdLabel(id, fileLink)} release request.`
  }
}

const proceedRequestCommentView = (approver) => {
  return `<@${approver.id}> initiated this release request.  :tada:`
}

const rejectRequestManagerView = (requestData, rejecter) => {
  const { id, fileLink } = requestData;
  return {
    text: `<@${rejecter.id}> rejected ${requestIdLabel(id, fileLink)} request.`
  }
}

const rejectRequestAuthorView = (requestData, rejecter) => {
  const { id, fileLink } = requestData;
  return {
    text: `<@${rejecter.id}> rejected your ${requestIdLabel(id, fileLink)} request.`
  }
}

const rejectRequestCommentView = (rejecter) => {
  return `<@${rejecter.id}> rejected this release request.`
}

const releaseManagerUpdateView = (auther, releaseManagers) => {
  return {
    text: `${auther} set ${releaseManagers.join(', ')} as Release Manager`
  }
}

const invalidRequestIdView = (id) => {
  return {
    response_type: 'ephemeral',
    text: `Request *\`${id}\`* is invalid`
  }
}

const showProgressView = (requests = []) => {
  return {
    response_type: 'ephemeral',
    text: requests.map(({ id, fileLink, progress }) => `Request Id: ${requestIdLabel(id, fileLink)} \nProgress: *\`${progress || 'requested'}\`*`).join('\n\n')
  }
}

const cancelProgressNotPossibleView = ({ id, fileLink }) => {
  return {
    response_type: 'ephemeral',
    text: `Request ${requestIdLabel(id, fileLink)} has proceed. Cancalation not possible.`
  }
}

const confirmCancelProgressView = ({ id, fileLink }) => {
  const { callback_id, yes, no } = cancelRequest;
  return {
    response_type: 'ephemeral',
    text: '',
    attachments: [
      {
        text: `Do you like to cancel ${requestIdLabel(id, fileLink)}?`,
        fallback: "You've got a release request. Please check.",
        callback_id,
        color: "#3AA3E3",
        attachment_type: "default",
        actions: [
          {
            name: no,
            text: "No",
            type: "button",
            style: "primary"
          },
          {
            name: yes,
            text: "Yes",
            type: "button",
            style: "danger",
            value: id,
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

const cancelProgressAuthorView = ({ id, fileLink }) => {
  return {
    response_type: 'ephemeral',
    text: `You've canceled ${requestIdLabel(id, fileLink)} request`
  }
}

const cancelProgressManagerView = ({ id, fileLink }, user) => {
  return {
    text: `<@${user.id}> canceled ${requestIdLabel(id, fileLink)} progress`
  }
}

const cancelProgressCommentView = (user) => {
  return `<@${user.id}> canceled progress`
}

// const menu = {
//   response_type: 'in_channel',
//   channel: slackReqObj.channel_id,
//   text: 'Hello :slightly_smiling_face:',
//   attachments: [{
//     text: 'What report would you like to get?',
//     fallback: 'What report would you like to get?',
//     color: '#2c963f',
//     attachment_type: 'default',
//     callback_id: 'report_selection',
//     actions: [{
//       name: 'reports_select_menu',
//       text: 'Choose a report...',
//       type: 'select',
//       options: [
//         {
//           text: 'Activation',
//           value: 'activation'
//         },
//         {
//           text: 'Hotfix',
//           value: 'hotfix'
//         }
//       ],
//     }],
//   }],
// };


module.exports = {
  requestTypes,
  requestDialogView,
  requestConfirmView,
  requestCallbackId,
  configCallbackId,
  usersLabel,
  configReadView,
  configDialogView,
  requestApprovalView,
  proceedRequestAlreadyInitiatedView,
  proceedRequestManagerView,
  proceedRequestChannelView,
  proceedRequestAuthorView,
  rejectRequestManagerView,
  rejectRequestAuthorView,
  releaseManagerUpdateView,
  proceedRequestCommentView,
  rejectRequestCommentView,
  showProgressView,
  cancelProgressNotPossibleView,
  confirmCancelProgressView,
  cancelProgressAuthorView,
  cancelProgressManagerView,
  cancelProgressCommentView,
  invalidRequestIdView,
  approval,
  cancelRequest
}
