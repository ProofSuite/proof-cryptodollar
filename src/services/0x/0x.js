import { ZeroEx } from '0x.js'
import providers from '../../helpers/providers'

export const getOx = ({ provider, networkID }) => {
  if (!provider) provider = providers.getRemoteLegacyProvider({ url: 'http://rinkeby.infura.io' })
  const oX = new ZeroEx(provider, { networkID })
  return oX
}

export const getOxFromInjectedProvider = ({ networkID }) => {
  const provider = providers.getLegacyInjectedProvider()
  const oX = new ZeroEx(provider, { networkID })
  return oX
}

export const get0xFromLedgerProvider = ({ networkID, url }) => {
  const provider = providers.getLedgerRemoteProvider(networkID, url)
  const oX = new ZeroEx(provider, { networkID })
  return oX
}
