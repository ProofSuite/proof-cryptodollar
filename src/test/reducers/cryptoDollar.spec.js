import cryptoDollarReducer from '../../reducers/data/cryptoDollar'
import chai from 'chai'

import {
  QUERYING_CRYPTODOLLAR_STATE,
  QUERY_CRYPTODOLLAR_STATE_SUCCESS,
  QUERY_CRYPTODOLLAR_STATE_ERROR
} from '../../actions/cryptoDollar/queryContractState'

const expect = chai.expect

describe('rewards reducer', () => {
  it('should return the initial state', () => {
    const initialState = {
      loading: true,
      error: null,
      data: null
    }
    expect(cryptoDollarReducer(undefined, {})).to.deep.equal(initialState)
  })

  it(`should handle ${QUERYING_CRYPTODOLLAR_STATE}`, () => {
    let action = { type: QUERYING_CRYPTODOLLAR_STATE }
    const expectedState = {
      loading: true,
      error: null,
      data: null
    }
    expect(cryptoDollarReducer(undefined, action)).to.deep.equal(expectedState)
  })

  it(`should handle ${QUERY_CRYPTODOLLAR_STATE_ERROR}`, () => {
    let action = { type: QUERY_CRYPTODOLLAR_STATE_ERROR, payload: { error: 'error ' } }
    let expectedState = {
      loading: false,
      error: action.payload.error,
      data: null
    }
    expect(cryptoDollarReducer(undefined, action)).to.deep.equal(expectedState)
  })

  it(`should handle ${QUERY_CRYPTODOLLAR_STATE_SUCCESS}`, () => {
    let data = {
      currentPoolIndex: 10,
      currentEpoch: 20,
      currentPoolBalance: 10e18
    }
    let action = { type: QUERY_CRYPTODOLLAR_STATE_SUCCESS, payload: { data } }
    let expectedState = {
      loading: false,
      error: null,
      data: data
    }
    expect(cryptoDollarReducer(undefined, action)).to.deep.equal(expectedState)
  })
})
