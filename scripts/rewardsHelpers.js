/**
 * @description Computes the epoch corresponding to a certain blocknumber
 * @param {Number} currentBlockNumber
 * @param {Number} initialBlockNumber
 * @param {Number} blockPerEpoch
 * @returns {Number} - Epoch number
 */
const computeEpoch = (currentBlockNumber, initialBlockNumber, blocksPerEpoch) => {
  let expectedEpoch = (currentBlockNumber - initialBlockNumber.toNumber()) / (blocksPerEpoch)
  expectedEpoch = Math.floor(expectedEpoch)
  return expectedEpoch
}

/**
 * @description Computes the blocknumber of the first block corresponding to an epoch
 * @param {Number} epochIndex
 * @param {Number} creationBlockNumber
 * @param {Number} blockPerEpoch
 * @returns {Number} - Blocknumber at epoch start
 */
const computeBlockNumberAtEpochStart = (epochIndex, creationBlockNumber, blocksPerEpoch) => {
  return (creationBlockNumber.toNumber() + epochIndex * blocksPerEpoch)
}

module.exports = { computeEpoch, computeBlockNumberAtEpochStart }
