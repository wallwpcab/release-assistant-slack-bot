const requestTypes = {
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

const requestMapping = {
  callback_id: 'request'
}

const approvalMapping = {
  callback_id: 'aproval',
  initiate: 'initiate',
  reject: 'reject'
}

module.exports = {
  requestTypes,
  requestMapping,
  approvalMapping,
};
