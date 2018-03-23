export const getTruffleContractAddress = (artifact, networkID) => {
  networkID = networkID || 8888
  return artifact.networks[networkID].address
}

export const getTruffleContractABI = (artifact) => (
  artifact.abi
)

export const getTruffleContractParams = (artifact, networkID) => {
  let address = getTruffleContractAddress(artifact, networkID)
  let abi = getTruffleContractABI(artifact)

  return [abi, address]
}

export const getWeb3ContractInstance = (web3, artifact, networkID) => {
  let params = getTruffleContractParams(artifact, networkID)
  let contract = new web3.eth.Contract(...params)
  return contract
}
