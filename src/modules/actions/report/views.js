const { isEmpty } = require('ramda')

const { slackUserTag, makeTitleCase } = require('../../../utils')
const { DeploymentStatus } = require('../../request/mappings')
const { buildLabel } = require('../build/views')

const statusLabel = report => report.ok ? '*Confirmed*. :white_check_mark:' : '*Incorrect*. :no_entry:'

const confirmedReportAuthorView = (section, report) => {

  return {
    text: `You've reported *${section.label}* section as ${statusLabel(report)}`
  }
}

const confirmedReportManagerView = (build, section, report, pendinSections, user) => {
  const { triggerLink } = build
  const getAttachment = () => {
    if (isEmpty(pendinSections)) {
      return {
        text: `All sections are reported.
Click <${triggerLink}|*here*> to promote to \`${makeTitleCase(DeploymentStatus.production)}\` environment.`
      }
    }

    return {
      text: `Pending sections:
      ${pendinSections.map(section => `# *${section.label}*`).join('\n')}`
    }
  }


  return {
    text: `Daily Build ${buildLabel(build)}
${slackUserTag(user)} reported *${section.label}* section as ${statusLabel(report)}`,
    attachments: [
      getAttachment()
    ]
  }
}

module.exports = {
  confirmedReportAuthorView,
  confirmedReportManagerView
}
