import walletReducer from '../../reducers/data/wallet'
import chai from 'chai'

import {
  WALLETS_LOADING,
  WALLETS_ERROR,
  ADD_WALLET,
  SET_DEFAULT_WALLET,
  ADD_WALLETS,
  DELETE_WALLET,
  DELETE_WALLETS,
  WALLET_AUTHENTICATING,
  WALLET_AUTHENTICATED,
  WALLET_AUTHENTICATION_ERROR,
  WALLET_UNAUTHENTICATE
} from '../../actions/walletActions'

const expect = chai.expect

const serializedWallet = JSON.stringify({
  salt: '67YrtLxm6qGNgzIPY6HPBxjW3oATs8l2TmvV1Zll2+U=',
  hdPathString: "m/44'/60'/0'/0",
  encSeed: {
    encStr: 'LOpBAzuNT0Zx5f7tFdXhHEFMmyt7ktB0T8b0uFZYhU6R9+GtNLzHcB5ICl5V5xDFeDLSE8VMBRegVdUFDfEnoF3dSUXnesAhN5dShi+wMiS/4EORN3oh6IEn4eWqaJla1oGTaxIpnBozcCbh+5kxD3YE9c2btNpJALJB7BaCGDU8C3pY4u9CcQ==',
    nonce: 'X7Ph+SKxiu6+4xbQ07GnY/VzVDgL7yYT'
  },
  encHdRootPriv: {
    encStr: 'MwI9UtmS9n64zXewZAQAhG2VHR/PqiQfTzPudWbX4n/3+JpAXNX+k4JFGEhk9WKI8PBaI6GkOICrPQ6ecAy90Q0gE+PFvOaBh/X0fZ/teleNES7VvFSlKkCeUppneeyGJiPVnwMkV8adyHceJWVvKfFz44tYT/gaVia2JAoQXw==',
    nonce: '/w2R/m5a39mNXZcLFErb1reYwff8VdTi'
  },
  version: 3,
  hdIndex: 1,
  encPrivKeys: {
    c838efcb6512a2ca12027ebcdf9e1fc5e4ff7ee3: {
      key: 'DX+LkOaQ6T7TF0Lgw5DnPs9DulGVSsLTgcSL4e8tlg50YU4DgR3ITXV88eANHG2/',
      nonce: '4M6YxEGOPXXbs7ZBEVTg77VgXurbTJCg'
    }
  },
  addresses: ['c838efcb6512a2ca12027ebcdf9e1fc5e4ff7ee3']
})

const initialState = {
  status: {
    loading: false,
    error: null,
    defaultWallet: null
  },
  authentication: {
    authenticating: false,
    authenticated: false,
    error: null
  },
  byAddress: {},
  allAddresses: []
}

describe('Wallet reducer', () => {
  it('Should return the initial state', () => {
    expect(walletReducer(initialState, {})).to.deep.equal(initialState)
  })

  it(`should handle ${WALLETS_LOADING}`, () => {
    let action = { type: WALLETS_LOADING }
    let expectedState = {
      status: {
        loading: true,
        error: null,
        defaultWallet: null
      },
      authentication: {
        authenticating: false,
        authenticated: false,
        error: null
      },
      byAddress: {},
      allAddresses: []
    }
    expect(walletReducer(undefined, action)).to.deep.equal(expectedState)
  })

  it(`should handle ${WALLETS_ERROR}`, () => {
    let action = { type: WALLETS_ERROR, payload: { error: 'Some error' } }
    let expectedState = {
      status: {
        loading: false,
        error: 'Some error',
        defaultWallet: null
      },
      authentication: {
        authenticating: false,
        authenticated: false,
        error: null
      },
      byAddress: {},
      allAddresses: []
    }
    expect(walletReducer(undefined, action)).to.deep.equal(expectedState)
  })

  it(`should handle ${SET_DEFAULT_WALLET}`, () => {
    let action = { type: SET_DEFAULT_WALLET, payload: { defaultWallet: '0x1234' } }
    let expectedState = {
      ...initialState,
      status: {
        loading: false,
        error: null,
        defaultWallet: '0x1234'
      }
    }
    expect(walletReducer(undefined, action)).to.deep.equal(expectedState)
  })

  it(`should handle ${WALLET_AUTHENTICATING}`, () => {
    let action = { type: WALLET_AUTHENTICATING }
    let expectedState = {
      status: {
        loading: false,
        error: null,
        defaultWallet: null
      },
      authentication: {
        authenticating: true,
        authenticated: false,
        error: null
      },
      byAddress: {},
      allAddresses: []
    }
    expect(walletReducer(undefined, action)).to.deep.equal(expectedState)
  })

  it(`should handle ${WALLET_AUTHENTICATED}`, () => {
    let action = { type: WALLET_AUTHENTICATED }
    let state = {
      ...initialState,
      authentication: {
        authenticating: false,
        authenticated: true,
        error: null
      }
    }
    expect(walletReducer(initialState, action)).to.deep.equal(state)
  })

  it(`should handle ${WALLET_UNAUTHENTICATE}`, () => {
    let initialState = {
      status: {
        loading: false,
        error: null,
        defaultWallet: null
      },
      authentication: {
        authenticating: false,
        authenticated: true,
        error: null
      },
      byAddress: {},
      allAddresses: []
    }
    let expectedState = {
      ...initialState,
      authentication: {
        authenticating: false,
        authenticated: false,
        error: null
      }
    }

    let action = { type: WALLET_UNAUTHENTICATE }
    expect(walletReducer(initialState, action)).to.deep.equal(expectedState)
  })

  it(`should handle ${WALLET_AUTHENTICATION_ERROR}`, () => {
    let action = { type: WALLET_AUTHENTICATION_ERROR, payload: { error: 'Some error' } }
    let expectedState = {
      ...initialState,
      authentication: {
        authenticating: false,
        authenticated: false,
        error: 'Some error'
      }
    }
    expect(walletReducer(undefined, action)).to.deep.equal(expectedState)
  })

  it(`should handle ${ADD_WALLET}`, () => {
    let serialized = serializedWallet
    let address = '0xc838efcb6512a2ca12027ebcdf9e1fc5e4ff7ee3'
    let action = { type: ADD_WALLET, payload: { serialized, address } }
    let expectedState = {
      ...initialState,
      byAddress: {
        '0xc838efcb6512a2ca12027ebcdf9e1fc5e4ff7ee3': {
          address: '0xc838efcb6512a2ca12027ebcdf9e1fc5e4ff7ee3',
          serialized: serialized
        }
      },
      allAddresses: ['0xc838efcb6512a2ca12027ebcdf9e1fc5e4ff7ee3']
    }
    expect(walletReducer(undefined, action)).to.deep.equal(expectedState)
  })

  it(`should handle ${DELETE_WALLET}`, () => {
    let serialized = serializedWallet
    let address = '0xc838efcb6512a2ca12027ebcdf9e1fc5e4ff7ee3'
    let action = { type: DELETE_WALLET, payload: { serialized, address } }
    let state = {
      ...initialState,
      byAddress: {
        '0xc838efcb6512a2ca12027ebcdf9e1fc5e4ff7ee3': {
          address: '0xc838efcb6512a2ca12027ebcdf9e1fc5e4ff7ee3',
          serialized: serialized
        }
      },
      allAddresses: ['0xc838efcb6512a2ca12027ebcdf9e1fc5e4ff7ee3']
    }
    let expectedState = {
      ...initialState,
      byAddress: {},
      allAddresses: []
    }
    expect(walletReducer(state, action)).to.deep.equal(expectedState)
  })
})
