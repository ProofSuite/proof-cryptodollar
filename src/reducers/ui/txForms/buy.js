import {
  BUY_CRYPTODOLLAR_TX_STARTED,
  BUY_CRYPTODOLLAR_TX_UPDATED,
  BUY_CRYPTODOLLAR_TX_ERROR,
  BUY_CRYPTODOLLAR_TX_SIGNED,
  BUY_CRYPTODOLLAR_TX_SIGNING,
  BUY_CRYPTODOLLAR_TX_SIGNING_ERROR,
  BUY_CRYPTODOLLAR_TX_SENT,
  BUY_CRYPTODOLLAR_TX_RECEIPT,
  BUY_CRYPTODOLLAR_TX_CONFIRMED
} from '../../../actions/cryptoDollar/buy'

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

const buy = (state = initialState, action) => {
  switch (action.type) {
    case BUY_CRYPTODOLLAR_TX_STARTED:
      return {
        ...state,
        txLoading: false,
        txError: null
      }
    case BUY_CRYPTODOLLAR_TX_UPDATED:
      return {
        ...state,
        tx: {
          ...(state.tx),
          status: action.payload.status,
          statusMessage: action.payload.statusMessage,
          requiredGas: action.payload.requiredGas
        }
      }
    case BUY_CRYPTODOLLAR_TX_ERROR:
      return {
        ...state,
        txLoading: false,
        txError: action.payload.error,
        tx: {
          ...(state.tx),
          receipt: action.payload.receipt
        }
      }
    case BUY_CRYPTODOLLAR_TX_SIGNING:
      return {
        ...state,
        txSigning: true,
        txSigned: false,
        txSigningError: null
      }
    case BUY_CRYPTODOLLAR_TX_SIGNED:
      return {
        ...state,
        txSigning: false,
        txSigned: true,
        txSigningError: null,
        tx: {
          ...(state.tx),
          signature: action.payload.signature
        }
      }
    case BUY_CRYPTODOLLAR_TX_SIGNING_ERROR:
      return {
        ...state,
        txSigning: false,
        txSigned: true,
        txSigningError: action.payload.error
      }
    case BUY_CRYPTODOLLAR_TX_SENT:
      return {
        ...state,
        txLoading: false,
        txError: null,
        tx: {
          ...(state.tx),
          receipt: null,
          hash: action.payload.hash
        }
      }
    case BUY_CRYPTODOLLAR_TX_RECEIPT:
      return {
        ...state,
        txLoading: false,
        txError: null,
        tx: {
          ...(state.tx),
          receipt: action.payload.receipt
        }
      }
    case BUY_CRYPTODOLLAR_TX_CONFIRMED:
      return {
        ...state,
        txLoading: false,
        txError: null
      }
    default:
      return state
  }
}

export default buy
