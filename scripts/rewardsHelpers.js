
const computeEpoch = (currentBlockNumber, initialBlockNumber, blocksPerEpoch) => {
  let expectedEpoch = (currentBlockNumber - initialBlockNumber.toNumber()) / (blocksPerEpoch)
  expectedEpoch = Math.floor(expectedEpoch)
  return expectedEpoch
}

const computeBlockNumberAtEpochStart = (epochIndex, creationBlockNumber, blocksPerEpoch) => {
  return (creationBlockNumber.toNumber() + epochIndex * blocksPerEpoch)
}

module.exports = { computeEpoch, computeBlockNumberAtEpochStart }