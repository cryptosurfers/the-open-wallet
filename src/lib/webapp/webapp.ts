import { WebAppMethod } from './protocol'
import type { WalletCreated, WalletRemoved, WalletUpdated } from './protocol'

const tg = window.Telegram.WebApp

const binArrayToJson = function (binArray: Uint8Array) {
  let str = ''
  for (let i = 0; i < binArray.length; i++) {
    str += String.fromCharCode(parseInt(binArray[i].toString()))
  }
  return JSON.parse(str)
}

class TheOpenProtocol {
  constructor(public webapp: typeof tg) {
    this.webapp = webapp
  }
  createWallet({ params }: Omit<WalletCreated, 'method'>) {
    this.webapp.sendData(JSON.stringify({ method: WebAppMethod.WALLET_CREATED, params: {
      ...params,
      publicKey: binArrayToJson(params.publicKey)
    } }))
  }
  updateWallet({ params }: Omit<WalletUpdated, 'method'>) {
    this.webapp.sendData(JSON.stringify({ method: WebAppMethod.WALLET_UPDATED, params }))
  }
  deleteWallet({ params }: Omit<WalletRemoved, 'method'>) {
    this.webapp.sendData(JSON.stringify({ method: WebAppMethod.WALLET_REMOVED, params }))
  }
}

export default new TheOpenProtocol(tg)
