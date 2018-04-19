import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import BuyCryptoDollarTxForm from '../components/cryptoDollar/txForms/BuyCryptoDollarTxForm'
import LoaderLayout from './LoaderLayout'

import styles from './TestLayout.css'

class TestLayout extends Component {

  renderLoading () {
    return <LoaderLayout />
  }

  renderTestLayout () {
    return (
      <div className={styles.content} >
        <div className={styles.buyTxContainer}>
          <BuyCryptoDollarTxForm />
        </div>
      </div>
    )
  }

  render () {
    let { loading, error } = this.props.web3

    if (loading || error) {
      return this.renderLoading()
    } else {
      return this.renderTestLayout()
    }
  }
}

TestLayout.propTypes = {
  web3: PropTypes.object
}

const mapStateToProps = state => ({
  web3: state.data.web3
})

export default connect(mapStateToProps)(TestLayout)
