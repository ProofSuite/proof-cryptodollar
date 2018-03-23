import React from 'react'
import { Form } from 'semantic-ui-react'
import PropTypes from 'prop-types'

const GasSettingsInput = ({ gas, gasPrice, handleChange }) => {
  return (
    <Form.Group>
      <Form.Input
        placeholder='Gas'
        name='gas'
        value={gas}
        onChange={handleChange}
      />
      <Form.Input
        placeholder='Gas Price'
        name='gasPrice'
        value={gasPrice}
        onChange={handleChange}
      />
    </Form.Group>
  )
}

GasSettingsInput.propTypes = {
  gas: PropTypes.string,
  gasPrice: PropTypes.string,
  handleChange: PropTypes.func
}

export default GasSettingsInput
