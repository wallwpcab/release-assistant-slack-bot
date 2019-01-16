
const { requestTypes } = require('../mappings')

const requestIdLabel = (id, fileLink) => fileLink ? `*<${fileLink}|\`${id}\`>*` : `*\`${id}\`*`

const typeLabel = (type) => {
  const { label, icon } = requestTypes[type]
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

const usersLabel = (users) => {
  const quotedUsers = users.map(u => `${u}`)
  const firstButLastUsers = quotedUsers.slice(0, -1).join(', ')
  const [lastUser = ''] = quotedUsers.slice(-1)
  const otherUsers = (firstButLastUsers && ', ' + firstButLastUsers) + (lastUser && ` and ${lastUser}`)
  return `you${otherUsers}`
}

const subscribersLabel = (subscribers) => {
  const users = subscribers.map(u => `${u}`).join(' ')
  return users && `//cc ${users}`
}

const dateLabel = (sep = '.') => {
  const date = new Date()
  return `${date.getDate()}${sep}${date.getMonth()}${sep}${date.getFullYear()}`
}

const gitCheckoutLabel = ({ id, type, baseCommit }) => {
  const commit = baseCommit || '__COMMIT_SHA__'
  return `git checkout -b release/${type}/${dateLabel('')}/${id} ${commit}`
}

const gitCherryPickLabel = (requests) => {
  const commits = Object.values(requests)
    .filter(r => !r.progress)
    .map(r => r.commits)
    .reduce((acc, r) => acc.concat(r), [])

  return commits.map(c => `git cherry-pick -x ${c}`).join('\n')
}

module.exports = {
  requestIdLabel,
  typeLabel,
  approvalLabel,
  descriptionLabel,
  commitsLabel,
  requestLabel,
  usersLabel,
  subscribersLabel,
  dateLabel,
  gitCheckoutLabel,
  gitCherryPickLabel
}
