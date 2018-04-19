import withdrawRewardsReducer from '../../reducers/ui/txForms/withdrawRewards'
import chai from 'chai'

import {
  WITHDRAW_REWARDS_TX_STARTED,
  WITHDRAW_REWARDS_TX_ERROR,
  WITHDRAW_REWARDS_TX_SIGNING,
  WITHDRAW_REWARDS_TX_SIGNED,
  WITHDRAW_REWARDS_TX_SIGNING_ERROR,
  WITHDRAW_REWARDS_TX_UPDATED,
  WITHDRAW_REWARDS_TX_SENT,
  WITHDRAW_REWARDS_TX_RECEIPT,
  WITHDRAW_REWARDS_TX_CONFIRMED
} from '../../actions/rewards/withdraw'

const expect = chai.expect

let initialState = {
  txLoading: false,
  txError: null,
  txSigning: false,
  txSigned: false,
  txSigningError: null,
  tx: {
    status: 'incomplete',
    statusMessage: null,
    requiredGas: null,
    hash: null,
    receipt: null,
    signature: null
  }
}

describe('Withdraw Rewards Reducer', () => {
  it('should return the initial state', () => {
    expect(withdrawRewardsReducer(undefined, {})).to.deep.equal(initialState)
  })

  it(`should handle ${WITHDRAW_REWARDS_TX_STARTED}`, () => {
    let action = { type: WITHDRAW_REWARDS_TX_STARTED }
    let newState = {
      ...initialState,
      txLoading: false,
      txError: null
    }
    expect(withdrawRewardsReducer(undefined, action)).to.deep.equal(newState)
  })

  it(`should handle ${WITHDRAW_REWARDS_TX_UPDATED}`, () => {
    let action = {
      type: WITHDRAW_REWARDS_TX_UPDATED,
      payload: {
        status: 'invalid',
        statusMessage: 'Account locked',
        requiredGas: '200000'
      }
    }
    let newState = {
      ...initialState,
      tx: {
        ...initialState.tx,
        status: 'invalid',
        statusMessage: 'Account locked',
        requiredGas: '200000'
      }
    }
    expect(withdrawRewardsReducer(undefined, action)).to.deep.equal(newState)
  })
})
