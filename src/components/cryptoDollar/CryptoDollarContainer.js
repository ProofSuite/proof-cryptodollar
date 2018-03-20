import { connect } from 'react-redux'
import CryptoDollar from './ui/CryptoDollar'
import { formatEther } from '../../helpers/formatHelpers'
import {
  buyCryptoDollar,
  sellCryptoDollar,
  sellUnpeggedCryptoDollar,
  transferCryptoDollar,
  fetchCryptoDollarContractState
} from './cryptoDollarActions'

const formatContractData = ({ data, loading }) => {
  data = {
    totalSupply: formatEther({ wei: data.totalSupply }),
    totalOutstanding: formatEther({ wei: data.totalOutstanding }),
    buffer: formatEther({ wei: data.buffer }),
    contractBalance: formatEther({ wei: data.contractBalance })
  }
  return { data, loading }
}

const mapStateToProps = state => {
  console.log(state.cryptoDollar.contractState)
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
