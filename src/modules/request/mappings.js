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
  branch: 'branch',
  staging: 'staging',
  production: 'production'
}

const DeploymentStatus = {
  initial: 'initial',
  branch: 'branch',
  staging: 'staging',
  production: 'production'
}

module.exports = {
  RequestType,
  Request,
  RequestApproval,
  RequestStatus,
  DeploymentStatus
}
