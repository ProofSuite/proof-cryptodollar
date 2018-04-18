import contractAddressesReducer from '../../reducers/data/contractAddresses.js'
import chai from 'chai'

import {
  CONTRACT_ADDRESSES_LOADING,
  CONTRACT_ADDRESSES_ERROR,
  UPDATE_CONTRACT_ADDRESSES
} from '../../actions/contractAddressesActions'

const expect = chai.expect

let initialState = {
  loading: true,
  error: null,
  contracts: {}
}

describe('contract addresses reducer', () => {
  it(`should handle ${CONTRACT_ADDRESSES_LOADING}`, () => {
    let action = { type: CONTRACT_ADDRESSES_LOADING }
    let expectedState = { ...initialState, loading: true }
    expect(contractAddressesReducer(initialState, action)).to.deep.equal(expectedState)
  })

  // TODO input example contracts payload
  it(`should handle ${UPDATE_CONTRACT_ADDRESSES}`, () => {
    let contracts = { 'cryptoDollar': '0x123' }
    let action = { type: UPDATE_CONTRACT_ADDRESSES, payload: { contracts } }
    let expectedState = { ...initialState, contracts, loading: false }
    expect(contractAddressesReducer(initialState, action)).to.deep.equal(expectedState)
  })

  it(`should handle ${CONTRACT_ADDRESSES_ERROR}`, () => {
    let error = 'error'
    let action = { type: CONTRACT_ADDRESSES_ERROR, payload: { error } }
    let expectedState = { ...initialState, error, loading: false }
    expect(contractAddressesReducer(initialState, action)).to.deep.equal(expectedState)
  })
})
