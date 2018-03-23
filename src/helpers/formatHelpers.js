import accounting from 'accounting-js'

export const formatEtherColumn = (data) => {
  data = data.map((elem) => { return elem / (10 ** 18) })
  return accounting.formatColumn(data, { symbol: 'ETH', format: '%v %s' })
}

export const formatCUSDColumn = (data) => {
  data = data.map((elem) => { return elem / (100) })
  return accounting.formatColumn(data, { symbol: '$' })
}
