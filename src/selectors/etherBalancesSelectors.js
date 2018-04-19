export const getAllEtherBalances = (state) => state.allAddresses.map(address => state.byAddress[address])
export const getEtherBalanceByAddress = (state, address) => state.byAddress[address]

export const getEtherBalances = (state, addresses) => {
  return addresses.map(address => {
    if (!state.byAddress[address]) {
      return '...'
    } else {
      return state.byAddress[address]
    }
  })
}
