import rewardsReducer from '../../reducers/data/rewards'
import chai from 'chai'

import {
  QUERYING_REWARDS_STATE,
  QUERY_REWARDS_STATE_SUCCESS,
  QUERY_REWARDS_STATE_ERROR
} from '../../actions/rewards/queryContractState'

const expect = chai.expect

describe('rewards reducer', () => {
  it('should return the initial state', () => {
    const initialState = {
      loading: true,
      error: null,
      data: {
        currentPoolIndex: '',
        currentEpoch: '',
        currentPoolBalance: ''
      }
    }
    expect(rewardsReducer(undefined, {})).to.deep.equal(initialState)
  })

  it(`should handle ${QUERYING_REWARDS_STATE}`, () => {
    let action = { type: QUERYING_REWARDS_STATE }
    const expectedState = {
      loading: true,
      error: null,
      data: {
        currentPoolIndex: '',
        currentEpoch: '',
        currentPoolBalance: ''
      }
    }
    expect(rewardsReducer(undefined, action)).to.deep.equal(expectedState)
  })

  it(`should handle ${QUERY_REWARDS_STATE_ERROR}`, () => {
    let action = { type: QUERY_REWARDS_STATE_ERROR, payload: { error: 'error ' } }
    let expectedState = {
      loading: false,
      error: action.payload.error,
      data: {
        currentPoolIndex: '',
        currentEpoch: '',
        currentPoolBalance: ''
      }
    }
    expect(rewardsReducer(undefined, action)).to.deep.equal(expectedState)
  })

  it(`should handle ${QUERY_REWARDS_STATE_SUCCESS}`, () => {
    let data = {
      currentPoolIndex: 10,
      currentEpoch: 20,
      currentPoolBalance: 10e18
    }
    let action = { type: QUERY_REWARDS_STATE_SUCCESS, payload: { data } }
    let expectedState = {
      loading: false,
      error: null,
      data: data
    }
    expect(rewardsReducer(undefined, action)).to.deep.equal(expectedState)
  })
})
