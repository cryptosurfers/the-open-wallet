import { WebAppMethod } from './protocol'
import type { WalletCreated, WalletRemoved, WalletUpdated } from './protocol'

const tg = window.Telegram.WebApp

class TheOpenProtocol {
  constructor(public webapp: typeof tg) {
    this.webapp = webapp
  }
  createWallet({ params }: Omit<WalletCreated, 'method'>) {
    this.webapp.sendData(JSON.stringify({ method: WebAppMethod.WALLET_CREATED, params }))
  }
  updateWallet({ params }: Omit<WalletUpdated, 'method'>) {
    this.webapp.sendData(JSON.stringify({ method: WebAppMethod.WALLET_UPDATED, params }))
  }
  deleteWallet({ params }: Omit<WalletRemoved, 'method'>) {
    this.webapp.sendData(JSON.stringify({ method: WebAppMethod.WALLET_REMOVED, params }))
  }
}

export default new TheOpenProtocol(tg)
