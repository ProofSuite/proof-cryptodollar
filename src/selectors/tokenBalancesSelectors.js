export const getAllTokenBalances = state => state.allIds.map(id => state.byId[id])
export const getTokenBalanceById = (state, id) => state.byId[id]

export const getTokenBalance = (state, tokenAddress, accountAddress) => {
  let tokenBalances = getAllTokenBalances(state)
  let tokenBalance = tokenBalances.filter(item => {
    return item.tokenAddress === tokenAddress && item.accountAddress === accountAddress
  })

  return tokenBalance
}

export const getTokenBalancesByAccountAddress = (state, address) => {
  let tokenBalances = getAllTokenBalances(state)
  let tokenBalancesByAccountAddress = tokenBalances.reduce((result, item) => {
    if (item.accountAddress === address) {
      result.push({
        tokenAddress: item.tokenAddress,
        tokenBalance: item.tokenBalance
      })
    }
    return tokenBalancesByAccountAddress
  }, [])
}

export const getTokenBalancesByTokenAddress = (state, address) => {
  let tokenBalances = getAllTokenBalances(state)
  let tokenBalancesByTokenAddress = tokenBalances.reduce((result, item) => {
    if (item.tokenAddress === address) {
      result.push(item)
    }
    return tokenBalancesByTokenAddress
  }, [])
}
