import tokenBalancesReducer from '../../reducers/data/token'
import chai from 'chai'

import {
  TOKEN_LOADING,
  TOKEN_ERROR,
  UPDATE_TOKEN,
  DELETE_TOKEN
} from '../../actions/tokenActions'

const expect = chai.expect

let initialState = {
  status: {
    loading: false,
    error: null
  },
  byAddress: {},
  allAddresses: []
}

describe('ether balances reducer', () => {
  it('should return the initial state', () => {
    expect(tokenBalancesReducer(undefined, {})).to.deep.equal(initialState)
  })

  //TODO how to handle loading -> true ?
  it(`should handle ${TOKEN_LOADING}`, () => {
    let action = { type: TOKEN_LOADING }
    let newState = {
      ...initialState,
      status: {
        loading: true,
        error: null
      }
    }
    expect(tokenBalancesReducer(initialState, action)).to.deep.equal(newState)
  })

  it(`should handle ${TOKEN_ERROR}`, () => {
    let error = 'error'
    let action = { type: TOKEN_ERROR, payload: { error } }
    let newState = {
      ...initialState,
      status: {
        loading: true,
        error: error
      }
    }
    expect(tokenBalancesReducer(initialState, action)).to.deep.equal(newState)
  })

  it(`should handle ${UPDATE_TOKEN}`, () => {
    let payload = {
      address: '0xe84da28128a48dd5585d1abb1ba67276fdd70776',
      symbol: 'PRFT'
    }
    let action = { type: UPDATE_TOKEN, payload }
    let newState = {
      ...initialState,
      byAddress: {
        [payload.address]: {
          address: payload.address,
          symbol: payload.symbol
        }
      },
      allAddresses: [ payload.address ]
    }
    expect(tokenBalancesReducer(initialState, action)).to.deep.equal(newState)
  })

  it(`should handle ${DELETE_TOKEN}`, () => {
    let payload = { address: '0xe84da28128a48dd5585d1abb1ba67276fdd70776' }
    let action = { type: DELETE_TOKEN, payload: payload }
    let state = {
      ...initialState,
      byAddress: {
        [action.payload.address]: {
          address: action.payload.adddress,
          symbol: 'SYM'
        }
      },
      allAddresses: [ action.payload.address ]
    }
    let newState = {
      ...initialState,
      byAddress: {},
      allAddresses: []
    }
    expect(tokenBalancesReducer(state, action)).to.deep.equal(newState)
  })
})
