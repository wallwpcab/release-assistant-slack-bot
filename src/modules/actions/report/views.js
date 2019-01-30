const { slackUserTag } = require('../../../utils')

const confirmedReportView = (user)=> ({
  text: `${slackUserTag(user)} confirmed :white_check_mark:`
})

module.exports = {
  confirmedReportView
}
