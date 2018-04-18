import React from 'react'
import PropTypes from 'prop-types'
import { Progress } from 'antd'

const EncryptionProgressBar = ({ percent }) => {
  return (
    <Progress percent={percent} />
  )
}

EncryptionProgressBar.propTypes = {
  percent: PropTypes.number
}

export default EncryptionProgressBar
