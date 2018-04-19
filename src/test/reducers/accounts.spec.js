import accountReducer from '../../reducers/data/accounts'
import chai from 'chai'

import {
  ACCOUNTS_LOADING,
  ACCOUNT_ERROR,
  ADD_ACCOUNT,
  ADD_ACCOUNTS
} from '../../actions/accountActions'

const expect = chai.expect

const initialState = {
  status: {
    loading: false,
    error: null
  },
  addresses: []
}

describe('account reducer', () => {
  it('should handle ACCOUNT_LOADING', () => {
    let action = { type: ACCOUNTS_LOADING }
    let expectedState = { ...initialState, status: { loading: true, error: null }}
    expect(accountReducer(initialState, action)).to.deep.equal(expectedState)
  })

  it('should handle ACCOUNT_ERROR', () => {
    let action = { type: ACCOUNT_ERROR, payload: { error: 'Some error' } }
    let expectedState = { ...initialState, status: { loading: false, error: 'Some error' } }
    expect(accountReducer(initialState, action)).to.deep.equal(expectedState)
  })

  it('should handle add ADD_ACCOUNT', () => {
    let action = {
      type: ADD_ACCOUNT,
      payload: { account: '0xdf08f82de32b8d460adbe8d72043e3a7e25a3b39' }
    }
    let expectedState = { ...initialState, addresses: [ action.payload.account] }
    expect(accountReducer(initialState, action)).to.deep.equal(expectedState)
  })

  it('should handle ADD_ACCOUNTS', () => {
    let accounts = [
      '0x6704fbfcd5ef766b287262fa2281c105d57246a6',
      '0x97a3fc5ee46852c1cf92a97b7bad42f2622267cc',
      '0x26064a2e2b568d9a6d01b93d039d1da9cf2a58cd'
    ]
    let action = { type: ADD_ACCOUNTS, payload: { accounts } }
    let expectedState = { ...initialState, addresses: accounts }
    expect(accountReducer(initialState, action)).to.deep.equal(expectedState)
  })
})
