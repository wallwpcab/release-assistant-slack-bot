const { Report } = require('./mappings')

const reportFormView = (sections) => ({
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

module.exports = {
  reportFormView
}
