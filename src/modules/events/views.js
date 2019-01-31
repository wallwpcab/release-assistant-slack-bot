const { DeploymentStatus } = require('../request/mappings')
const { DeploymentEvent } = require('./mappings')
const { slackUserTag, makeTitleCase } = require('../../utils')
const { requestIdLabel } = require('../request/views')
const { buildLabel } = require('../actions/build/views')

const releaseManagerUpdatedView = (user, releaseManagers) => {
  const slackUsers = releaseManagers.map(m => slackUserTag(m)).join(', ')
  return {
    text: `${slackUserTag(user)} set ${slackUsers} as Release Manager`
  }
}

const branchBuildManagerView = ({ build }) => {
  const { branch, commitId, triggerLink, environment } = build
  return {
    text: `*\`${makeTitleCase(environment)}\`* build status is *SUCCESS*.`,
    attachments: [
      {
        text: `Branch: \`${branch}\`\nCommit Id: \`${commitId}\``
      },
      {
        text: `Click <${triggerLink}|*here*> to promote to \`${makeTitleCase(DeploymentStatus.staging)}\` environment.`
      }
    ]
  }
}

const stagingBuildManagerView = ({ build }) => {
  const { branch, commitId, triggerLink } = build
  return {
    text: `*\`${makeTitleCase(DeploymentStatus.staging)}\`* build status is *SUCCESS*.`,
    attachments: [
      {
        text: `Build: ${buildLabel(build)}\nBranch: \`${branch}\`\nCommit Id: \`${commitId}\``
      },
      {
        text: `Click <${triggerLink}|*here*> to promote to \`${makeTitleCase(DeploymentStatus.production)}\` environment.`
      }
    ]
  }
}

const stagingBuildChannelView = ({ id, build, requests }) => {
  const getActionName = reqId => JSON.stringify({ depId: id, reqId })
  return {
    text: `*${makeTitleCase(DeploymentStatus.staging)}* build ${buildLabel(build)} *SUCCEED*.`,
    attachments: [
      ...requests.map(request => ({
        text: `${slackUserTag(request.user)} please confirm ${requestIdLabel(request)} is in staging.`,
        callback_id: DeploymentEvent.staging.callback_id,
        color: "#3AA3E3",
        actions: [
          {
            name: getActionName(request.id),
            text: "Go! :rocket:",
            type: "button",
            style: "primary",
            value: DeploymentEvent.staging.confirmed,
            confirm: {
              title: 'Are you sure?',
              text: 'Would you like to mark as Confirmed?',
              ok_text: 'Yes',
              dismiss_text: 'No'
            }
          },
          {
            name: getActionName(request.id),
            text: "Incorrect :no_entry:",
            type: "button",
            style: "danger",
            value: DeploymentEvent.staging.incorrect,
            confirm: {
              title: 'Are you sure?',
              text: 'Would you like to mark as Incorrect?',
              ok_text: 'Yes',
              dismiss_text: 'No'
            }
          }
        ]
      }))
    ]
  }
}

const productionBuildChannelView = ({ build, requests }) => {
  const { branch, commitId } = build
  const userTags = requests.map(({ user }) => slackUserTag(user)).join(', ')
  return {
    text: `<@here> *\`${makeTitleCase(DeploymentStatus.production)}\`* build status is *SUCCESS*. :tada:\n//cc ${userTags}`,
    attachments: [
      {
        text: `Build: ${buildLabel(build)}\nBranch: \`${branch}\`\nCommit Id: \`${commitId}\``
      }
    ]
  }
}

module.exports = {
  releaseManagerUpdatedView,
  branchBuildManagerView,
  stagingBuildManagerView,
  stagingBuildChannelView,
  productionBuildChannelView
}
