 /**
 * @description Returns the deployed contract address corresponding to a
 * certain contract address
 * @param artifact
 * @param networkID
 * @returns Truffle contract address
 */
export const getTruffleContractAddress = (artifact, networkID) => {
  return artifact.networks[networkID].address
}

 /**
 * @description Returns the ABI (interface) of a truffle contract
 * @param artifact
 * @returns Truffle contract ABI
 */
export const getTruffleContractABI = (artifact) => (
  artifact.abi
)

/**
 * @description Returns the ABI (interface) and contract address of a deployed truffle contract
 * @param artifact
 * @param networkID
 * @returns Contract ABI and contract address
 */
export const getTruffleContractParams = (artifact, networkID) => {
  let address = getTruffleContractAddress(artifact, networkID)
  let abi = getTruffleContractABI(artifact)

  return [abi, address]
}

/**
 * @description Returns a web3 contract instance from a truffle artifact and a network ID
 * @param web3 - web3 instance
 * @param artifact - truffle artifact (json file)
 * @returns Web3 Contract Instance
 */
export const getContractInstance = (artifact, provider) => {
  let { web3, networkID } = provider
  let params = getTruffleContractParams(artifact, networkID)
  let contract = new web3.eth.Contract(...params)
  return contract
}

/**
 * @description Returns a web3 contract instance from an ERC20 truffle artifact and an address
 * @param web3 - web3 instance
 * @param tokenAddress - deployed contract address
 * @returns Web3 Contract Instance
 */
export const getERC20Instance = (web3, tokenAddress) => {
  let abi = ''
  let contract = new web3.eth.Contract(abi, tokenAddress)
  return contract
}
