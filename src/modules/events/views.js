const { DeploymentStatus } = require('../request/mappings')
const { slackUserTag } = require('../../utils')

const releaseManagerUpdatedView = (user, releaseManagers) => {
  const slackUsers = releaseManagers.map(m => slackUserTag(m)).join(', ')
  return {
    text: `${slackUserTag(user)} set ${slackUsers} as Release Manager`
  }
}

const branchBuildManagerView = (build) => {
  const { branch, commitId, triggerLink, environment } = build
  return {
    text: `${environment} build status is *SUCCESS*.`,
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

const stagingBuildManagerView = (build) => {
  const { id, branch, commitId, triggerLink, environment } = build
  return {
    text: `${environment} build status is *SUCCESS*.`,
    attachments: [
      {
        text: `Build: ${id}\nBranch: \`${branch}\`\nCommit Id: \`${commitId}\``
      },
      {
        text: `Click <${triggerLink}|*here*> to promote to \`${DeploymentStatus.production}\` environment.`
      }
    ]
  }
}

const productionBuildChannelView = (build) => {
  const { id, branch, commitId, environment } = build
  return {
    text: `@here ${environment} build status is *SUCCESS*. :tada:`,
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
  productionBuildChannelView
}
