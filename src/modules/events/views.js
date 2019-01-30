const { DeploymentStatus } = require('../request/mappings')
const { DeploymentEvent } = require('./mappings')
const { slackUserTag, makeTitleCase } = require('../../utils')
const { requestIdLabel } = require('../request/views')

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
        text: `Click <${triggerLink}|*here*> to promote to \`${DeploymentStatus.staging}\` environment.`
      }
    ]
  }
}

const stagingBuildManagerView = ({ build }) => {
  const { id, branch, commitId, triggerLink } = build
  return {
    text: `*\`${makeTitleCase(DeploymentStatus.staging)}\`* build status is *SUCCESS*.`,
    attachments: [
      {
        text: `Build: ${id}\nBranch: \`${branch}\`\nCommit Id: \`${commitId}\``
      },
      {
        text: `Click <${triggerLink}|*here*> to promote to \`${DeploymentStatus.staging}\` environment.`
      }
    ]
  }
}

const stagingBuildChannelView = ({ id, build, requests }) => {
  const getActionName = reqId => JSON.stringify({ depId: id, reqId })
  return {
    text: `*${makeTitleCase(DeploymentStatus.staging)}* build \`${build.id}\` *SUCCEED*.`,
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
            value: DeploymentEvent.staging.confirmed
          },
          {
            name: getActionName(request.id),
            text: "Incorrect :no_entry:",
            type: "button",
            style: "danger",
            value: DeploymentEvent.staging.incorrect
          }
        ]
      }))
    ]
  }
}

const productionBuildChannelView = ({ build, requests }) => {
  const { id, branch, commitId } = build
  const userTags = requests.map(({ user }) => slackUserTag(user)).join(', ')
  return {
    text: `<@here> *\`${makeTitleCase(DeploymentStatus.production)}\`* build status is *SUCCESS*. :tada:\n//cc ${userTags}`,
    attachments: [
      {
        text: `Build: ${id}\nBranch: \`${branch}\`\nCommit Id: \`${commitId}\``
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
