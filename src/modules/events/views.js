const { DeploymentStatus } = require('../request/mappings')

const releaseManagerUpdatedView = (auther, releaseManagers) => {
  return {
    text: `${auther} set ${releaseManagers.join(', ')} as Release Manager`
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

module.exports = {
  releaseManagerUpdatedView,
  branchBuildManagerView
}
