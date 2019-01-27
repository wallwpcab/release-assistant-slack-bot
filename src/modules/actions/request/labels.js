const { requestIdLabel } = require('../../request/views')
const { RequestType } = require('../../request/mappings')

const typeLabel = (type) => {
  const { label, icon } = RequestType[type]
  return `*\`${label}\`* ${icon}`
}

const approvalLabel = (aproval) => {
  return aproval ? '*`YES`*' : '*`NO`*'
}

const descriptionLabel = (desc) => {
  return `\`\`\`${desc}\`\`\``
}

const commitsLabel = (commits) => {
  return `\`\`\`${commits.join(',\n')}\`\`\``
}

const requestLabel = ({
  id,
  type,
  commits,
  description,
  approval,
  file,
  user
}) => {
  return `
Id:\t\t\t\t${requestIdLabel(id, file)}
Author:\t\t<@${user.id}>
Type:\t\t\t${typeLabel(type)}
Approval:\t${approvalLabel(approval)}
Description: ${descriptionLabel(description)}
Commits: ${commitsLabel(commits)}
`
}

const gitCheckoutLabel = ({ baseCommit, build }) => {
  const commit = baseCommit || '__COMMIT_SHA__'
  return `git checkout -b ${build.branch} ${commit}`
}

const gitCherryPickLabel = ({ requests }) => {
  const commits = requests.map(r => r.commits)
    .reduce((acc, r) => acc.concat(r), [])

  return commits.map(c => `git cherry-pick -x ${c}`).join('\n')
}

module.exports = {
  typeLabel,
  approvalLabel,
  descriptionLabel,
  commitsLabel,
  requestLabel,
  gitCheckoutLabel,
  gitCherryPickLabel
}
