const { Report } = require('./mappings')
const { getReportStatus } = require('./utils')

const reportFormView = sections => ({
  title: 'Request a relesase',
  callback_id: Report.callback_id,
  submit_label: 'Submit',
  elements: [
    {
      label: 'Report section',
      name: Report.section,
      type: 'select',
      hint: 'Choose a section',
      options: sections.map(({ id, label }) => ({ value: id, label }))
    },
    {
      label: 'Status',
      name: Report.status,
      type: 'select',
      hint: 'Choose a status',
      options: [
        {
          label: 'Ok',
          value: Report.ok
        },
        {
          label: 'Problemetic',
          value: Report.problemetic
        }
      ]
    },
    {
      label: 'Description',
      type: 'textarea',
      name: Report.description,
      optional: true,
      hint: 'Put problem description'
    }
  ]
})

const reportStatusView = (reportSections, dailyReport) => {
  const reportLabel = report => (report.ok ? '*Ok* :white_check_mark:' : '*`Problemetic`* :no_entry:')
  const reported = getReportStatus(reportSections, dailyReport)
    .filter(status => !!status.report)
    .map(status => `# ${status.section.label}    : ${reportLabel(status.report)}`)

  const pending = getReportStatus(reportSections, dailyReport)
    .filter(status => !status.report)
    .map(status => `# ${status.section.label}           : *\`Pending\`* :clock1:`)

  const reportedGroup = reported.length ? `Reported:
${reported.join('\n')}
` : ''

  const pendingGroup = pending.length ? `
Pending:
${pending.join('\n')}
` : ''

  return {
    response_type: 'ephemeral',
    text: `${reportedGroup}
${pendingGroup}`
  }
}

module.exports = {
  reportFormView,
  reportStatusView
}
