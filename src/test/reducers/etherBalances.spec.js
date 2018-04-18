import etherBalancesReducer from '../../reducers/data/etherBalances'
import chai from 'chai'

import {
  ETHER_BALANCES_LOADING,
  ETHER_BALANCES_ERROR,
  UPDATE_ETHER_BALANCE,
  UPDATE_ETHER_BALANCES,
  DELETE_ETHER_BALANCE
} from '../../actions/etherBalancesActions'

const expect = chai.expect

describe('ether balances reducer', () => {
  it('should return the initial state', () => {
    let expectedInitialState = {
      status: {
        loading: false,
        error: null
      },
      byAddress: {},
      allAddresses: []
    }
    expect(etherBalancesReducer(undefined, {})).to.deep.equal(expectedInitialState)
  })

  it('should handle ETHER_BALANCES_LOADING', () => {
    let action = { type: ETHER_BALANCES_LOADING }
    let expectedState = {
      status: {
        loading: true,
        error: null
      },
      byAddress: {},
      allAddresses: []
    }
    expect(etherBalancesReducer(undefined, action)).to.deep.equal(expectedState)
  })

  it('should handle ETHER_BALANCES_ERROR', () => {
    let error = 'Some error'
    let action = { type: ETHER_BALANCES_ERROR, payload: { error } }
    let expectedState = {
      status: {
        loading: false,
        error: error
      },
      byAddress: {},
      allAddresses: []
    }
    expect(etherBalancesReducer(undefined, action)).to.deep.equal(expectedState)
  })

  it('should handle UPDATE_ETHER_BALANCE', () => {
    let payload = { address: '0x26064a2e2b568d9a6d01b93d039d1da9cf2a58cd', etherBalance: 1 }
    let action = { type: UPDATE_ETHER_BALANCE, payload }
    let expectedState = {
      status: {
        loading: false,
        error: null
      },
      byAddress: {
        [payload.address]: {
          address: payload.address,
          etherBalance: payload.etherBalance
        }
      },
      allAddresses: [payload.address]
    }
    expect(etherBalancesReducer(undefined, action)).to.deep.equal(expectedState)
  })

  it(`should handle ${UPDATE_ETHER_BALANCES}`, () => {
    let addresses = [
      '0x26064a2e2b568d9a6d01b93d039d1da9cf2a58cd',
      '0x97a3fc5ee46852c1cf92a97b7bad42f2622267cc'
    ]
    let payload = {
      etherBalances: [{
        address: '0x26064a2e2b568d9a6d01b93d039d1da9cf2a58cd',
        etherBalance: 10
      },
      {
        address: '0x97a3fc5ee46852c1cf92a97b7bad42f2622267cc',
        etherBalance: 10
      }
      ]
    }
    let action = { type: UPDATE_ETHER_BALANCES, payload }
    let expectedState = {
      status: {
        loading: false,
        error: null
      },
      byAddress: {
        [payload.etherBalances[0].address]: {
          address: payload.etherBalances[0].address,
          etherBalance: payload.etherBalances[0].etherBalance
        },
        [payload.etherBalances[1].address]: {
          address: payload.etherBalances[1].address,
          etherBalance: payload.etherBalances[1].etherBalance
        }
      },
      allAddresses: [...addresses]
    }
    expect(etherBalancesReducer(undefined, action)).to.deep.equal(expectedState)
  })

  it(`should hanlde ${DELETE_ETHER_BALANCE}`, () => {
    let payload = { address: '0x26064a2e2b568d9a6d01b93d039d1da9cf2a58cd' }
    let action = { type: DELETE_ETHER_BALANCE, payload: payload }
    let initialState = {
      status: {
        loading: false,
        error: null
      },
      byAddress: {
        [payload.address]: {
          etherBalance: 10
        }
      },
      allAddresses: [payload.address]
    }
    let expectedState = {
      status: {
        loading: false,
        error: null
      },
      byAddress: {},
      allAddresses: []
    }
    expect(etherBalancesReducer(initialState, action)).to.deep.equal(expectedState)
  })
})
