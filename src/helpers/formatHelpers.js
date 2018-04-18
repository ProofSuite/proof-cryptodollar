import accounting from 'accounting-js'

/**
 * @description Formats an array of ether balances to be displayed in a table
 * @param data [Array] - Array of ether balances
 * @returns [Array] - Array of formatted ether balances
 */
export const formatEtherColumn = (data) => {
  data = data.map((elem) => { return elem / (10 ** 18) })
  return accounting.formatColumn(data, { symbol: 'ETH', format: '%v %s' })
}

/**
 * @description Formats an array of cryptodollar or $ balances to be displayed in a table
 * @param data [Array] - Array of cryptodollar or $ balances
 * @returns [Array] - Array of formatted balances
 */
export const formatCUSDColumn = (data) => {
  data = data.map((elem) => { return elem / (100) })
  return accounting.formatColumn(data, { symbol: '$' })
}
