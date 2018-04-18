import {
  SELL_CRYPTODOLLAR_TX_STARTED,
  SELL_CRYPTODOLLAR_TX_UPDATED,
  SELL_CRYPTODOLLAR_TX_ERROR,
  SELL_CRYPTODOLLAR_TX_SIGNED,
  SELL_CRYPTODOLLAR_TX_SIGNING,
  SELL_CRYPTODOLLAR_TX_SIGNING_ERROR,
  SELL_CRYPTODOLLAR_TX_SENT,
  SELL_CRYPTODOLLAR_TX_RECEIPT,
  SELL_CRYPTODOLLAR_TX_CONFIRMED
} from '../../../actions/cryptoDollar/sell'

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

const sell = (state = initialState, action) => {
  switch (action.type) {
    case SELL_CRYPTODOLLAR_TX_STARTED:
      return {
        ...state,
        txLoading: false,
        txError: null
      }
    case SELL_CRYPTODOLLAR_TX_UPDATED:
      return {
        ...state,
        tx: {
          ...(state.tx),
          status: action.paylad.status,
          statusMessage: action.paylad.statusMessage,
          requiredGas: action.payload.requiredGas
        }
      }
    case SELL_CRYPTODOLLAR_TX_ERROR:
      return {
        ...state,
        txLoading: false,
        txError: action.payload.error,
        tx: {
          ...(state.tx),
          receipt: action.payload.receipt
        }
      }
    case SELL_CRYPTODOLLAR_TX_SIGNING:
      return {
        ...state,
        txSigning: true,
        txSigned: false,
        txSigningError: null
      }
    case SELL_CRYPTODOLLAR_TX_SIGNED:
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
    case SELL_CRYPTODOLLAR_TX_SIGNING_ERROR:
      return {
        ...state,
        txSigning: false,
        txSigned: true,
        txSigningError: action.payload.error
      }
    case SELL_CRYPTODOLLAR_TX_SENT:
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
    case SELL_CRYPTODOLLAR_TX_RECEIPT:
      return {
        ...state,
        txLoading: false,
        txError: null,
        tx: {
          ...(state.tx),
          receipt: action.payload.receipt
        }
      }
    case SELL_CRYPTODOLLAR_TX_CONFIRMED:
      return {
        ...state,
        txLoading: false,
        txError: null
      }
    default:
      return state
  }
}

export default sell
