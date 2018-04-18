/**
 * @description Validates a transaction with the web3 estimateGas function and
 * returns the estimated gas and/or a message error if needed
 * @param web3 [Object] - web3 instance
 * @returns Raw Transaction
 */
export const validateTransaction = async (rawTx, params, gas) => {
  try {
    let requiredGas = await rawTx.estimateGas(params)
    if (gas && gas !== 0 && gas < requiredGas) {
      return { status: 'invalid', requiredGas: requiredGas, statusMessage: 'Insufficient Gas' }
    } else {
      return { status: 'valid', requiredGas: requiredGas, statusMessage: 'Transaction Valid' }
    }
  } catch (error) {
    return { status: 'invalid', requiredGas: null, statusMessage: error.message }
  }
}
