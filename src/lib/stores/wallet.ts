import { writable } from 'svelte/store'
import TonWeb from 'tonweb'

type WalletStore = {
  keyPair: nacl.SignKeyPair | undefined
  providerUrl: string
  apiKey: string
  ton: TonWeb
}

const providerUrl = 'https://toncenter.com/api/v2/jsonRPC'
const apiKey = '6494499baadce5c74d337dfa79efd3b525e3d94c012aa3f88a3f1a1c6eb4aa7c'

const initialWalletState: WalletStore = {
  keyPair: undefined,
  providerUrl,
  apiKey,
  ton: new TonWeb(new TonWeb.HttpProvider(providerUrl, { apiKey }))
}

const createWalletStore = () => {
  const store = writable<WalletStore>(initialWalletState)

  const setUserKeyPair = (keyPair: nacl.SignKeyPair) => {
    store.update((state) => {
      return { ...state, keyPair }
    })
  }

  return {
    subscribe: store.subscribe,
    setUserKeyPair
  }
}

export const walletStore = createWalletStore()
