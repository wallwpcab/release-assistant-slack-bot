const RequestType = {
  activation: {
    label: 'Activation',
    value: 'activation',
    icon: ':recycle:'
  },
  hotfix: {
    label: 'Hotfix',
    value: 'hotfix',
    icon: ':fire:'
  }
}

const Request = {
  callback_id: 'request'
}

const RequestApproval = {
  callback_id: 'aproval',
  approve: 'approve',
  reject: 'reject'
}

const RequestStatus = {
  initial: 'initial',
  approved: 'approved',
  rejected: 'rejected',
  inProgress: 'inProgress',
}

module.exports = {
  RequestType,
  Request,
  RequestApproval,
  RequestStatus
}
