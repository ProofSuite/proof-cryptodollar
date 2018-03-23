import { connect } from 'react-redux'
import CryptoDollar from './ui/CryptoDollar'
import {
  buyCryptoDollar,
  sellCryptoDollar,
  sellUnpeggedCryptoDollar,
  transferCryptoDollar,
  fetchCryptoDollarContractState
} from './cryptoDollarActions'

const mapStateToProps = state => {
  return {
    contractState: state.cryptoDollar.contractState,
    buyStatus: state.cryptoDollar.buy,
    sellStatus: state.cryptoDollar.sell,
    sellUnpeggedStatus: state.cryptoDollar.sellUnpegged,
    transferStatus: state.cryptoDollar.transfer
  }
}

const mapDispatchToProps = {
  buyCryptoDollar,
  sellCryptoDollar,
  sellUnpeggedCryptoDollar,
  transferCryptoDollar,
  fetchCryptoDollarContractState
}

export default connect(mapStateToProps, mapDispatchToProps)(CryptoDollar)
