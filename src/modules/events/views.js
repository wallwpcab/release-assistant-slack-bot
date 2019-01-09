const releaseManagerUpdatedView = (auther, releaseManagers) => {
  return {
    text: `${auther} set ${releaseManagers.join(', ')} as Release Manager`
  }
}

module.exports = {
  releaseManagerUpdatedView
}
