export const getAllTokens = (state) => state.allAddresses.map(id => state.byAddress[id])

export const getTokensByAddresses = (state, addresses) => {
  let allTokens = state.allAddresses.map(address => state.byAddress[address])
  let filteredTokens = allTokens.reduce((result, item) => {
    if (addresses.indexOf(item.address) !== -1) {
      result.push(item)
    }
    return result
  }, [])
  return filteredTokens
}

export const getTokensBySymbols = (state, symbols) => {
  let allTokens = state.allAddresses.map(address => state.byAddress[address])
  let filteredTokens = allTokens.reduce((result, item) => {
    if (symbols.indexOf(item.symbol) !== -1) {
      result.push(item)
    }
    return result
  }, [])
  return filteredTokens
}

export const getTokenByAddress = (state, address) => state.byAddress[address]

export const getTokenBySymbol = (state, symbol) => {
  let allTokens = state.allIds.map(id => state.byAddress[id])
  let tokenBySymbol = allTokens.filter((token) => (token.symbol === symbol))
  return tokenBySymbol
}
