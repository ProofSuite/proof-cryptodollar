export const getCryptoDollarBalanceByAddress = (state, address) =>
  state.byAddress[address]

export const getAllCryptoDollarBalances = state =>
  state.allAddresses.map(address => state.byAddress[address])

export const getCryptoDollarBalances = (state, addresses) => {
  return addresses.map(address => {
    if (!state.byAddress[address]) {
      return '...'
    } else {
      return state.byAddress[address].cryptoDollarBalance
    }
  })
}

export const getReservedEtherBalances = (state, addresses) => {
  return addresses.map(address => {
    if (!state.byAddress[address]) {
      return '...'
    } else {
      return state.byAddress[address].reservedEtherBalance
    }
  })
}
