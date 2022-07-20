export type TheOpenWalletMessage =
  | Transfer
  | CreateWallet
  | WalletCreated
  | WalletUpdated
  | WalletRemoved
  | RemoveWallet

interface WebAppMessage {
  method: WebAppMethod
}

export enum WebAppMethod {
  CREATE_WALLET = 'createWallet',
  TRANSFER = 'transfer',
  REMOVE_WALLET = 'removeWallet',
  WALLET_CREATED = 'walletCreated',
  WALLET_UPDATED = 'walletUpdated',
  WALLET_REMOVED = 'walletRemoved'
}

export interface CreateWallet extends WebAppMessage {
  method: WebAppMethod.CREATE_WALLET
  params?: any
}

export interface Transfer extends WebAppMessage {
  method: WebAppMethod.TRANSFER
  params: {
    from: string
    to: string
    amountNanoTon: number
  }
}

export interface RemoveWallet extends WebAppMessage {
  method: WebAppMethod.REMOVE_WALLET
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any
}

export interface WalletCreated extends WebAppMessage {
  method: WebAppMethod.WALLET_CREATED
  params: {
    address: string
    publicKey: Uint8Array
    version?: string
  }
}

export interface WalletUpdated extends WebAppMessage {
  method: WebAppMethod.WALLET_UPDATED
  params: {
    address: string
    publicKey: Uint8Array
    version?: string
  }
}

export interface WalletRemoved extends WebAppMessage {
  method: WebAppMethod.WALLET_REMOVED
  params?: any
}
