import React, { Component } from 'react'
import ProviderSettingsForm from './ProviderSettingsForm'
import { Card } from 'antd'

import styles from '../../layouts/SettingsLayout.css'

class ProviderSettings extends Component {

  render () {
    return (
        <div className={styles.providerSettings}>
          <Card >
            <ProviderSettingsForm {...this.props} />
          </Card>
        </div>
    )
  }
}

export default ProviderSettings
