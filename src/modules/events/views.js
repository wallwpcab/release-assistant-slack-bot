const { DeploymentStatus } = require('../request/mappings')
const { slackUserTag, makeTitleCase } = require('../../utils')

const releaseManagerUpdatedView = (user, releaseManagers) => {
  const slackUsers = releaseManagers.map(m => slackUserTag(m)).join(', ')
  return {
    text: `${slackUserTag(user)} set ${slackUsers} as Release Manager`
  }
}

const branchBuildManagerView = ({ build }) => {
  const { branch, commitId, triggerLink, environment } = build
  return {
    text: `\*\`${makeTitleCase(environment)}\`\* build status is *SUCCESS*.`,
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
    text: `\*\`${makeTitleCase(DeploymentStatus.staging)}\`\* build status is *SUCCESS*.`,
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

const stagingBuildChannelView = ({ build, requests }) => {
  const { id, branch, commitId } = build
  const userTags = requests.map((user) => slackUserTag(user)).join(', ')
  return {
    text: `\*\`${makeTitleCase(DeploymentStatus.staging)}\`\* build status is *SUCCESS*.\n${userTags} please confirm.`,
    attachments: [
      {
        text: `Build: ${id}\nBranch: \`${branch}\`\nCommit Id: \`${commitId}\``
      }
    ]
  }
}

const productionBuildChannelView = ({ build, requests }) => {
  const { id, branch, commitId } = build
  const userTags = requests.map((user) => slackUserTag(user)).join(', ')
  return {
    text: `@here \*\`${makeTitleCase(DeploymentStatus.production)}\`\* build status is *SUCCESS*. :tada:\n//cc ${userTags}`,
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
