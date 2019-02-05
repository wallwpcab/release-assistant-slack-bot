const {
  isEmpty
} = require('ramda')

const {
  slackUserTag, makeTitleCase
} = require('../../utils')
const {
  DeploymentStatus
} = require('../request/mappings')
const {
  buildLabel
} = require('../build/action-views')

const statusLabel = report => (report.ok ? '*Confirmed*. :white_check_mark:' : '*Incorrect*. :no_entry:')

const confirmedReportAuthorView = (section, report) => ({
  text: `You've reported *${section.label}* section as ${statusLabel(report)}`
})

const confirmedReportManagerView = (build, section, report, pendinSections, user) => {
  const {
    triggerLink
  } = build
  const getAttachment = () => {
    if (isEmpty(pendinSections)) {
      return {
        text: `All sections are reported.
Click <${triggerLink}|*here*> to promote to \`${makeTitleCase(DeploymentStatus.production)}\` environment.`
      }
    }

    return {
      text: `Pending sections:
      ${pendinSections.map(sec => `# *${sec.label}*`).join('\n')}`
    }
  }


  return {
    text: `
Dear *Release Manager*

${slackUserTag(user)} reported *${section.label}* section as ${statusLabel(report)} in *Staging* ${buildLabel(build)}`,
    attachments: [
      getAttachment()
    ],
    unfurl_links: false
  }
}

const confirmedReportChannelView = (build, section, report, pendinSections, user) => {
  const getAttachment = () => {
    if (isEmpty(pendinSections)) {
      return {
        text: 'All sections are reported.'
      }
    }

    return {
      text: `Pending sections:
      ${pendinSections.map(sec => `# *${sec.label}*`).join('\n')}`
    }
  }


  return {
    text: `
${slackUserTag(user)} reported *${section.label}* section as ${statusLabel(report)} in *Staging* ${buildLabel(build)}`,
    attachments: [
      getAttachment()
    ],
    unfurl_links: false
  }
}

module.exports = {
  confirmedReportAuthorView,
  confirmedReportManagerView,
  confirmedReportChannelView
}
