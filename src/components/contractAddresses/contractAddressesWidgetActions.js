import CryptoDollarInterface from '../../../build/contracts/CryptoDollar.json'
import CryptoFiatHubInterface from '../../../build/contracts/CryptoFiatHub.json'
import RewardsInterface from '../../../build/contracts/Rewards.json'
import StoreInterface from '../../../build/contracts/Store.json'
import { getTruffleContractAddress } from '../../helpers/contractHelpers'
import { updateContractAddresses } from '../../actions/contractAddressesActions.js'
import { getProviderUtils } from '../../helpers/web3.js'

export const CONTRACT_ADDRESSES_WIDGET_LOADING = 'CONTRACT_ADDRESSES_WIDGET_LOADING'
export const CONTRACT_ADDRESSES_WIDGET_ERROR = 'CONTRACT_ADDRESSES_WIDGET_ERROR'
export const CONTRACT_ADDRESSES_WIDGET_UPDATED = 'CONTRACT_ADDRESSES_WIDGET_UPDATED'

export const contractAddressesWidgetLoading = () => ({ type: CONTRACT_ADDRESSES_WIDGET_LOADING })
export const contractAddressesWidgetError = (error) => ({ type: CONTRACT_ADDRESSES_WIDGET_ERROR, payload: { error } })
export const contractAddressesWidgetUpdated = () => ({ type: CONTRACT_ADDRESSES_WIDGET_UPDATED })

export const queryContractAddresses = () => {
  return async (dispatch, getState) => {
    dispatch(contractAddressesWidgetLoading())

    let { networkID } = getProviderUtils(getState)
    let addresses = await Promise.all([
      getTruffleContractAddress(CryptoFiatHubInterface, networkID),
      getTruffleContractAddress(CryptoDollarInterface, networkID),
      getTruffleContractAddress(RewardsInterface, networkID),
      getTruffleContractAddress(StoreInterface, networkID)
    ])

    let [cryptoDollarAddress, cryptoFiatHubAddress, rewardsAddress, keyValueStoreAddress] = addresses

    let results = {
      cryptoDollar: cryptoDollarAddress,
      cryptoFiatHub: cryptoFiatHubAddress,
      rewards: rewardsAddress,
      store: keyValueStoreAddress
    }

    dispatch(updateContractAddresses(results))
    dispatch(contractAddressesWidgetUpdated())
  }
}
