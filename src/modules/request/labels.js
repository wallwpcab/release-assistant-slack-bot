const { requestIdLabel } = require('./views')
const { RequestType } = require('./mappings')
const { slackUserTag } = require('../../utils')
const { getApprovalText } = require('../../transformer')

const requestTypeLabel = (type) => {
  const { label, icon } = RequestType[type]
  return `*\`${label}\`* ${icon}`
}

const requestCommitsLabel = (commits) => {
  return `\`\`\`${commits.join(',\n')}\`\`\``
}

const approvalLabel = (approval) => {
  return `*\`${getApprovalText(approval)}\`*`
}

const descriptionLabel = (desc) => {
  return `\`\`\`${desc}\`\`\``
}

const requestDetailsLabel = ({
  id,
  type,
  commits,
  description,
  approval,
  permalink,
  user
}) => {
  return `Id					 : ${requestIdLabel({ id, permalink })}
Author			: ${slackUserTag(user)}
Type				: ${requestTypeLabel(type)}
Approval		 : ${approvalLabel(approval)}
Description	:
${descriptionLabel(description)}
Commits 		:
${requestCommitsLabel(commits)}`
}

const gitCheckoutLabel = ({ baseCommit, build }) => {
  const commit = baseCommit || '__COMMIT_SHA__'
  return `git checkout -b ${build.branch} ${commit}`
}

const gitCherryPickLabel = requests => {
  const commits = requests.map(r => r.commits)
    .reduce((acc, r) => acc.concat(r), [])

  return commits.map(c => `git cherry-pick -x ${c}`).join('\n')
}

module.exports = {
  requestTypeLabel,
  requestCommitsLabel,
  requestDetailsLabel,
  gitCheckoutLabel,
  gitCherryPickLabel
}
