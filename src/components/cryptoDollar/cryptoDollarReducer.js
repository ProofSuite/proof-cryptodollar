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
          loading: true,
          error: null,
          data: null,
          ...state.contractState
        }
      }
    case 'FETCH_CRYPTODOLLAR_STATE_SUCCESS':
      return {
        ...state,
        contractState: {
          loading: false,
          data: action.payload,
          ...state.contractState
        }
      }
    case 'FETCH_CRYPTODOLLAR_STATE_ERROR':
      return {
        ...state,
        contractState: {
          loading: false,
          data: null,
          ...state.contractState
        }
      }
    case 'BUY_CRYPTODOLLAR_TX_STARTED':
      return {
        ...state,
        buy: {
          loading: true,
          error: null,
          receipt: null,
          txHash: '',
          ...state.buy
        }
      }
    case 'BUY_CRYPTODOLLAR_TX_ERROR':
      return {
        ...state,
        buy: {
          loading: false,
          error: action.payload.error,
          receipt: action.payload.receipt,
          txHash: '',
          ...state.buy
        }
      }
    case 'BUY_CRYPTODOLLAR_TX_SENT':
      return {
        ...state,
        buy: {
          loading: false,
          error: null,
          receipt: null,
          txHash: action.payload,
          ...state.buy
        }
      }
    case 'BUY_CRYPTODOLLAR_TX_RECEIPT':
      return {
        ...state,
        buy: {
          loading: false,
          error: null,
          receipt: action.payload,
          txHash: state.buy.txHash,
          ...state.buy
        }
      }
    case 'BUY_CRYPTODOLLAR_TX_CONFIRMED':
      return {
        ...state,
        buy: {
          loading: false,
          error: null,
          ...state.buy
        }
      }
    case 'SELL_CRYPTODOLLAR_TX_STARTED':
      return {
        ...state,
        sell: {
          loading: true,
          error: null,
          receipt: null,
          txHash: '',
          ...state.sell
        }
      }
    case 'SELL_CRYPTODOLLAR_TX_ERROR':
      return {
        ...state,
        sell: {
          loading: false,
          error: action.payload.error,
          receipt: action.payload.receipt,
          txHash: '',
          ...state.sell
        }
      }
    case 'SELL_CRYPTODOLLAR_TX_SENT':
      return {
        ...state,
        sell: {
          loading: false,
          error: null,
          txHash: action.payload,
          receipt: null,
          ...state.sell
        }
      }
    case 'SELL_CRYPTODOLLAR_TX_RECEIPT':
      return {
        ...state,
        sell: {
          loading: false,
          error: null,
          receipt: action.payload,
          txHash: state.sell.txHash,
          ...state.sell
        }
      }
    case 'SELL_CRYPTODOLLAR_TX_CONFIRMED':
      return {
        ...state,
        sell: {
          loading: false,
          error: null,
          ...state.sell
        }
      }
    case 'SELL_UNPEGGED_CRYPTODOLLAR_TX_STARTED':
      return {
        ...state,
        sellUnpegged: {
          loading: true,
          error: null,
          receipt: null,
          txHash: '',
          ...state.sellUnpegged
        }
      }
    case 'SELL_UNPEGGED_CRYPTODOLLAR_TX_ERROR':
      return {
        ...state,
        sellUnpegged: {
          loading: false,
          error: action.payload.error,
          receipt: action.payload.receipt,
          ...state.sellUnpegged
        }
      }
    case 'SELL_UNPEGGED_CRYPTODOLLAR_TX_RECEIPT':
      return {
        ...state,
        sellUnpegged: {
          loading: false,
          error: null,
          receipt: action.payload,
          txHash: state.sellUnpegged.txHash,
          ...state.sellUnpegged
        }
      }
    case 'SELL_UNPEGGED_CRYPTODOLLAR_TX_CONFIRMED':
      return {
        ...state,
        sellUnpegged: {
          loading: false,
          error: null,
          receipt: action.payload,
          ...state.sellUnpegged
        }
      }
    case 'TRANSFER_CRYPTODOLLAR_TX_STARTED':
      return {
        ...state,
        transfer: {
          loading: false,
          error: null,
          receipt: null,
          ...state.sellUnpegged
        }
      }
    case 'TRANSFER_CRYPTODOLLAR_TX_SENT':
      return {
        ...state,
        transfer: {
          loading: false,
          error: null,
          receipt: null,
          txHash: action.payload,
          ...state.transfer
        }
      }
    case 'TRANSFER_CRYPTODOLLAR_TX_RECEIPT':
      return {
        ...state,
        transfer: {
          loading: false,
          error: null,
          receipt: action.payload,
          txHash: state.transfer.txHash,
          ...state.transfer
        }
      }
    case 'TRANSFER_CRYPTODOLLAR_TX_ERROR':
      return {
        ...state,
        transfer: {
          loading: false,
          error: action.payload.error,
          receipt: action.payload.receipt,
          txHash: '',
          ...state.transfer
        }
      }
    default:
      return state
  }
}
