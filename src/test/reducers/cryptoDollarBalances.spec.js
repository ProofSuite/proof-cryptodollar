import cryptoDollarBalancesReducer from '../../reducers/data/cryptoDollarBalances'
import chai from 'chai'

import {
  CRYPTODOLLAR_BALANCES_LOADING,
  CRYPTODOLLAR_BALANCES_ERROR,
  UPDATE_CRYPTODOLLAR_BALANCE,
  UPDATE_CRYPTODOLLAR_BALANCES,
  DELETE_CRYPTODOLLAR_BALANCE
} from '../../actions/cryptoDollarBalancesActions'

const expect = chai.expect

let initialState = {
  status: {
    loading: false,
    error: null
  },
  byAddress: {},
  allAddresses: []
}

describe('cryptodollar balances reducer', () => {
  it(`should handle ${CRYPTODOLLAR_BALANCES_LOADING}`, () => {
    let action = { type: CRYPTODOLLAR_BALANCES_LOADING }
    let newState = { ...initialState, status: { loading: true, error: null } }
    expect(cryptoDollarBalancesReducer(initialState, action)).to.deep.equal(newState)
  })

  it(`should handle ${CRYPTODOLLAR_BALANCES_ERROR}`, () => {
    let error = 'error'
    let action = { type: CRYPTODOLLAR_BALANCES_ERROR, payload: { error } }
    let newState = { ...initialState, status: { loading: false, error: error } }
    expect(cryptoDollarBalancesReducer(initialState, action)).to.deep.equal(newState)
  })

  it(`should handle ${UPDATE_CRYPTODOLLAR_BALANCE}`, () => {
    let payload = {
      address: '0x26064a2e2b568d9a6d01b93d039d1da9cf2a58cd',
      cryptoDollarBalance: 1,
      reservedEtherBalance: 1
    }
    let action = { type: UPDATE_CRYPTODOLLAR_BALANCE, payload }
    let newState = {
      status: {
        loading: false,
        error: null
      },
      byAddress: {
        [payload.address]: {
          address: payload.address,
          cryptoDollarBalance: payload.cryptoDollarBalance,
          reservedEtherBalance: payload.reservedEtherBalance
        }
      },
      allAddresses: [payload.address]
    }

    expect(cryptoDollarBalancesReducer(initialState, action)).to.deep.equal(newState)
  })

  it(`should handle ${UPDATE_CRYPTODOLLAR_BALANCES}`, () => {
    let addresses = [
      '0x26064a2e2b568d9a6d01b93d039d1da9cf2a58cd',
      '0x97a3fc5ee46852c1cf92a97b7bad42f2622267cc'
    ]
    let payload = {
      cryptoDollarBalances: [{
        address: '0x26064a2e2b568d9a6d01b93d039d1da9cf2a58cd',
        cryptoDollarBalance: 10,
        reservedEtherBalance: 10
      },
      {
        address: '0x97a3fc5ee46852c1cf92a97b7bad42f2622267cc',
        cryptoDollarBalance: 100,
        reservedEtherBalance: 100
      }
      ]
    }

    let action = { type: UPDATE_CRYPTODOLLAR_BALANCES, payload }
    let newState = {
      status: {
        loading: false,
        error: null
      },
      byAddress: {
        [payload.cryptoDollarBalances[0].address]: {
          address: payload.cryptoDollarBalances[0].address,
          cryptoDollarBalance: payload.cryptoDollarBalances[0].cryptoDollarBalance,
          reservedEtherBalance: payload.cryptoDollarBalances[0].reservedEtherBalance
        },
        [payload.cryptoDollarBalances[1].address]: {
          address: payload.cryptoDollarBalances[1].address,
          cryptoDollarBalance: payload.cryptoDollarBalances[1].cryptoDollarBalance,
          reservedEtherBalance: payload.cryptoDollarBalances[1].reservedEtherBalance
        }
      },
      allAddresses: addresses
    }
    expect(cryptoDollarBalancesReducer(initialState, action)).to.deep.equal(newState)
  })

  it(`should handle ${DELETE_CRYPTODOLLAR_BALANCE}`, () => {
    let payload = { address: '0x26064a2e2b568d9a6d01b93d039d1da9cf2a58cd' }
    let action = { type: DELETE_CRYPTODOLLAR_BALANCE, payload: payload }
    let state = {
      status: {
        loading: true,
        error: null
      },
      byAddress: {
        [payload.address]: {
          cryptoDollarBalance: 10
        }
      },
      allAddresses: [payload.address]
    }
    let newState = {
      status: {
        loading: false,
        error: null
      },
      byAddress: {},
      allAddresses: []
    }
    expect(cryptoDollarBalancesReducer(state, action)).to.deep.equal(newState)
  })
})
