import tokenBalancesReducer from '../../reducers/data/tokenBalances'
import chai from 'chai'

import {
  TOKEN_BALANCES_LOADING,
  TOKEN_BALANCES_ERROR,
  UPDATE_TOKEN_BALANCE,
  DELETE_TOKEN_BALANCE
} from '../../actions/tokenBalancesActions'

const expect = chai.expect

describe('ether balances reducer', () => {
  it('should return the initial state', () => {
    let expectedInitialState = {
      status: {
        loading: false,
        error: null
      },
      byId: {},
      allIds: []
    }
    expect(tokenBalancesReducer(undefined, {})).to.deep.equal(expectedInitialState)
  })

  it(`should handle ${TOKEN_BALANCES_LOADING}`, () => {
    let action = { type: TOKEN_BALANCES_LOADING }
    let expectedState = {
      status: {
        loading: true,
        error: null
      },
      byId: {},
      allIds: []
    }
    expect(tokenBalancesReducer(undefined, action)).to.deep.equal(expectedState)
  })

  it(`should handle ${TOKEN_BALANCES_ERROR}`, () => {
    let error = 'error'
    let action = { type: TOKEN_BALANCES_ERROR, payload: { error } }
    let expectedState = {
      status: {
        loading: true,
        error: error
      },
      byId: {},
      allIds: []
    }
    expect(tokenBalancesReducer(undefined, action)).to.deep.equal(expectedState)
  })

  it(`should handle ${UPDATE_TOKEN_BALANCE}`, () => {
    let payload = {
      id: 1,
      accountAddress: '0x26064a2e2b568d9a6d01b93d039d1da9cf2a58cd',
      tokenAddress: '0xe84da28128a48dd5585d1abb1ba67276fdd70776',
      tokenBalance: 1
    }
    let action = { type: UPDATE_TOKEN_BALANCE, payload }
    let expectedState = {
      status: {
        loading: false,
        error: null
      },
      byId: {
        '1': {
          id: 1,
          accountAddress: payload.accountAddress,
          tokenAddress: payload.tokenAddress,
          tokenBalance: 1
        }
      },
      allIds: [ 1 ]
    }
    expect(tokenBalancesReducer(undefined, action)).to.deep.equal(expectedState)
  })

  it(`should handle ${DELETE_TOKEN_BALANCE}`, () => {
    let payload = { id: 1 }
    let action = { type: DELETE_TOKEN_BALANCE, payload: payload }
    let initialState = {
      status: {
        loading: false,
        error: null
      },
      byId: {
        1: {
          id: 1,
          accountAddress: '0x26064a2e2b568d9a6d01b93d039d1da9cf2a58cd',
          tokenAddress: '0xe84da28128a48dd5585d1abb1ba67276fdd70776'
        }
      },
      allIds: [ 1 ]
    }
    let expectedState = {
      status: {
        loading: false,
        error: null
      },
      byId: {},
      allIds: []
    }
    expect(tokenBalancesReducer(initialState, action)).to.deep.equal(expectedState)
  })
})
