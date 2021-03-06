const {
  DeploymentStatus
} = require('../request/mappings')
const {
  BuildEvent
} = require('./mappings')
const {
  slackUserTag,
  makeTitleCase
} = require('../../utils')
const {
  requestIdLabel
} = require('../request/labels')
const {
  buildLabel
} = require('./action-views')

const releaseManagerUpdatedChannelView = (user, releaseManagers) => {
  const slackUsers = releaseManagers.map(m => slackUserTag(m)).join(', ')
  return {
    text: `${slackUserTag(user)} set ${slackUsers} as Release Manager.`
  }
}

const releaseManagerUpdatedManagerView = (releaseManagers) => {
  const slackUsers = releaseManagers.map(m => slackUserTag(m)).join(', ')
  return {
    text: `Hello ${slackUsers},
Congratulations! :tada:
You are the Release Manager for this week.`
  }
}

const branchBuildManagerView = ({
  build
}) => {
  const {
    branch,
    commitId,
    triggerLink,
    environment
  } = build
  return {
    text: `Dear *Release Manager*
*\`${makeTitleCase(environment)}\`* build status is *SUCCESS*.`,
    attachments: [
      {
        text: `Branch: \`${branch}\`
Commit Id: \`${commitId}\``
      },
      {
        text: `Click <${triggerLink}|*here*> to promote to \`${makeTitleCase(DeploymentStatus.staging)}\` environment.`
      }
    ]
  }
}

const stagingBuildManagerView = ({
  build
}) => {
  const {
    branch,
    commitId,
    triggerLink
  } = build
  return {
    text: `Dear *Release Manager*
*\`${makeTitleCase(DeploymentStatus.staging)}\`* build status is *SUCCESS*.`,
    attachments: [
      {
        text: `Build: ${buildLabel(build)}
Branch: \`${branch}\`
Commit Id: \`${commitId}\``
      },
      {
        text: `Click <${triggerLink}|*here*> to promote to \`${makeTitleCase(DeploymentStatus.production)}\` environment.`
      }
    ],
    unfurl_links: false
  }
}

const stagingBuildChannelView = ({
  id,
  build,
  requests
}) => {
  const getActionName = reqId => JSON.stringify({
    depId: id,
    reqId
  })
  return {
    text: `*${makeTitleCase(DeploymentStatus.staging)}* build ${buildLabel(build)} *SUCCEED*.`,
    attachments: [
      ...requests.map(request => ({
        text: `${slackUserTag(request.user)} please confirm ${requestIdLabel(request)} is in staging.`,
        callback_id: BuildEvent.staging.callback_id,
        color: '#3AA3E3',
        actions: [
          {
            name: getActionName(request.id),
            text: 'Go! :rocket:',
            type: 'button',
            style: 'primary',
            value: BuildEvent.staging.confirmed,
            confirm: {
              title: 'Are you sure?',
              text: 'Would you like to mark as Confirmed?',
              ok_text: 'Yes',
              dismiss_text: 'No'
            }
          },
          {
            name: getActionName(request.id),
            text: 'Incorrect :no_entry:',
            type: 'button',
            style: 'danger',
            value: BuildEvent.staging.incorrect,
            confirm: {
              title: 'Are you sure?',
              text: 'Would you like to mark as Incorrect?',
              ok_text: 'Yes',
              dismiss_text: 'No'
            }
          }
        ],
        unfurl_links: false
      }))
    ],
    unfurl_links: false
  }
}

const productionBuildChannelView = ({
  build, requests
}) => {
  const {
    branch, commitId
  } = build
  const userTags = requests ? `\n//cc ${requests.map(({ user }) => slackUserTag(user)).join(', ')}` : ''
  return {
    text: `<!here> *\`${makeTitleCase(DeploymentStatus.production)}\`* build status is *SUCCESS*. :tada:${userTags}`,
    attachments: [{
      text: `Build: ${buildLabel(build)}
Branch: \`${branch}\`
Commit Id: \`${commitId}\``
    }],
    unfurl_links: false
  }
}

module.exports = {
  releaseManagerUpdatedManagerView,
  releaseManagerUpdatedChannelView,
  branchBuildManagerView,
  stagingBuildManagerView,
  stagingBuildChannelView,
  productionBuildChannelView
}
