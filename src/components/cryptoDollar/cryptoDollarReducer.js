let initialState = {
  contractState: {
    loading: true,
    error: null,
    data: null
  },
  buy: {
    loading: false,
    error: null,
    receipt: null,
    txHash: ''
  },
  sell: {
    loading: false,
    error: null,
    receipt: null,
    txHash: ''
  },
  sellUnpegged: {
    loading: false,
    error: null,
    receipt: null,
    txHash: ''
  },
  transfer: {
    loading: false,
    error: null,
    receipt: null,
    txHash: ''
  }
}

export default function (state = initialState, action) {
  switch (action.type) {
    case 'FETCHING_CRYPTODOLLAR_STATE':
      return {
        ...state,
        contractState: {
          ...state.contractState,
          loading: true,
          data: null
        }
      }
    case 'FETCH_CRYPTODOLLAR_STATE_SUCCESS':
      return {
        ...state,
        contractState: {
          ...state.contractState,
          loading: false,
          data: action.payload
        }
      }
    case 'FETCH_CRYPTODOLLAR_STATE_ERROR':
      return {
        ...state,
        contractState: {
          ...state.contractState,
          loading: false,
          data: null
        }
      }
    case 'BUY_CRYPTODOLLAR_TX_STARTED':
      return {
        ...state,
        buy: {
          ...state.buy,
          loading: true,
          error: null,
          receipt: null,
          txHash: ''
        }
      }
    case 'BUY_CRYPTODOLLAR_TX_ERROR':
      return {
        ...state,
        buy: {
          ...state.buy,
          loading: false,
          error: action.payload.error,
          receipt: action.payload.receipt,
          txHash: ''
        }
      }
    case 'BUY_CRYPTODOLLAR_TX_SENT':
      return {
        ...state,
        buy: {
          ...state.buy,
          loading: false,
          error: null,
          receipt: null,
          txHash: action.payload
        }
      }
    case 'BUY_CRYPTODOLLAR_TX_RECEIPT':
      return {
        ...state,
        buy: {
          ...state.buy,
          loading: false,
          error: null,
          receipt: action.payload,
          txHash: state.buy.txHash
        }
      }
    case 'BUY_CRYPTODOLLAR_TX_CONFIRMED':
      return {
        ...state,
        buy: {
          ...state.buy,
          loading: false,
          error: null
        }
      }
    case 'SELL_CRYPTODOLLAR_TX_STARTED':
      return {
        ...state,
        sell: {
          ...state.sell,
          loading: true,
          error: null,
          receipt: null,
          txHash: ''
        }
      }
    case 'SELL_CRYPTODOLLAR_TX_ERROR':
      return {
        ...state,
        sell: {
          ...state.sell,
          loading: false,
          error: action.payload.error,
          receipt: action.payload.receipt,
          txHash: ''
        }
      }
    case 'SELL_CRYPTODOLLAR_TX_SENT':
      return {
        ...state,
        sell: {
          ...state.sell,
          loading: false,
          error: null,
          txHash: action.payload,
          receipt: null
        }
      }
    case 'SELL_CRYPTODOLLAR_TX_RECEIPT':
      return {
        ...state,
        sell: {
          ...state.sell,
          loading: false,
          error: null,
          receipt: action.payload,
          txHash: state.sell.txHash
        }
      }
    case 'SELL_CRYPTODOLLAR_TX_CONFIRMED':
      return {
        ...state,
        sell: {
          ...state.sell,
          loading: false,
          error: null
        }
      }
    case 'SELL_UNPEGGED_CRYPTODOLLAR_TX_STARTED':
      return {
        ...state,
        sellUnpegged: {
          ...state.sellUnpegged,
          loading: true,
          error: null,
          receipt: null,
          txHash: ''
        }
      }
    case 'SELL_UNPEGGED_CRYPTODOLLAR_TX_ERROR':
      return {
        ...state,
        sellUnpegged: {
          ...state.sellUnpegged,
          loading: false,
          error: action.payload.error,
          receipt: action.payload.receipt
        }
      }
    case 'SELL_UNPEGGED_CRYPTODOLLAR_TX_RECEIPT':
      return {
        ...state,
        sellUnpegged: {
          ...state.sellUnpegged,
          loading: false,
          error: null,
          receipt: action.payload,
          txHash: state.sellUnpegged.txHash
        }
      }
    case 'SELL_UNPEGGED_CRYPTODOLLAR_TX_CONFIRMED':
      return {
        ...state,
        sellUnpegged: {
          ...state.sellUnpegged,
          loading: false,
          error: null,
          receipt: action.payload
        }
      }
    case 'TRANSFER_CRYPTODOLLAR_TX_STARTED':
      return {
        ...state,
        transfer: {
          ...state.transfer,
          loading: false,
          error: null,
          receipt: null
        }
      }
    case 'TRANSFER_CRYPTODOLLAR_TX_SENT':
      return {
        ...state,
        transfer: {
          ...state.transfer,
          loading: false,
          error: null,
          receipt: null,
          txHash: action.payload
        }
      }
    case 'TRANSFER_CRYPTODOLLAR_TX_RECEIPT':
      return {
        ...state,
        transfer: {
          ...state.transfer,
          loading: false,
          error: null,
          receipt: action.payload,
          txHash: state.transfer.txHash
        }
      }
    case 'TRANSFER_CRYPTODOLLAR_TX_ERROR':
      return {
        ...state,
        transfer: {
          ...state.transfer,
          loading: false,
          error: action.payload.error,
          receipt: action.payload.receipt,
          txHash: ''
        }
      }
    default:
      return state
  }
}
