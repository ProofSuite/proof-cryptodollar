export const getAddresses = state => state.allAddresses
export const getWallets = state => state.allAddresses

export const getWalletList = state => {
  let walletList = state.allAddresses.map((address, index) => {
    return {
      key: index,
      wallet: address
    }
  })
  return walletList
}

export const getDefaultWallet = state => {
  let defaultWalletAddress = state.allAddresses[0]
  let defaultWallet = state.byAddress[defaultWalletAddress]
  return defaultWallet
}
