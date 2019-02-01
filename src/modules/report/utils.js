const { isSameDay } = require('date-fns')
const { Report } = require('./mappings')
const { getDate } = require('../../utils/generator')

const getSection = (reportFormData, reportSections) =>
  reportSections.find(({ id }) => id === reportFormData.section)

const getPendingSections = (reportSections, dailyReport) => {
  return reportSections.filter(section => {
    const report = dailyReport[section.id]
    return !report || !isSameDay(report.date, getDate())
  })
}

const getReportStatus = (reportSections, dailyReport) => reportSections.map(section => {
  let report = dailyReport[section.id]
  if (!report || !isSameDay(report.date, getDate())) {
    report = null
  }

  return {
    section,
    report
  }
})

const createReport = (reportFormData, user) => {
  return {
    id: reportFormData.section,
    ok: reportFormData.status === Report.ok,
    date: getDate(),
    user,
    description: reportFormData.description
  }
}

module.exports = {
  getSection,
  createReport,
  getPendingSections,
  getReportStatus
}
