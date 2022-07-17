import TonWeb from 'tonweb'
import type { WalletV3ContractR1 } from 'tonweb/dist/types/contract/wallet/v3/wallet-v3-contract-r1'
import type { Address } from 'tonweb/dist/types/utils/address'

interface TonWebWithPayments extends TonWeb {
  payments?: any
}

export class Channel {
  ton: TonWebWithPayments
  channel: any
  fromWallet: any
  wallet: WalletV3ContractR1
  constructor(
    public channelId: number, // Channel ID, for each new channel there must be a new ID
    public addressA: Address, // A's funds will be withdrawn to this wallet address after the channel is closed
    public addressB: Address, // B's funds will be withdrawn to this wallet address after the channel is closed
    public initBalanceA: string,
    public initBalanceB: string,
    public isA: boolean,
    public myKeyPair: any,
    public hisPublicKey: any,
    public apiKey: string,
    public providerUrl: string
  ) {
    this.channelId = channelId
    this.addressA = addressA
    this.addressB = addressB
    this.initBalanceA = initBalanceA
    this.initBalanceB = initBalanceB
    this.isA = isA
    this.myKeyPair = myKeyPair
    this.hisPublicKey = hisPublicKey
    this.ton = new TonWeb(new TonWeb.HttpProvider(providerUrl, { apiKey }))
    this.channel = this.ton.payments.createChannel({
      channelId,
      addressA,
      addressB,
      initBalanceA,
      initBalanceB,
      isA,
      myKeyPair,
      hisPublicKey
    })
    this.wallet = this.ton.wallet.create({
      publicKey: myKeyPair?.publicKey
    })
    this.fromWallet = this.channel.fromWallet({
      wallet: this.wallet,
      secretKey: myKeyPair?.secretKey
    })
  }

  // createChannel() {
  //   this.channel = this.ton.payments.createChannel({
  //     addressA: this.addressA,
  //     channelId: this.channelId,
  //     addressB: this.addressB,
  //     initBalanceA: this.initBalanceA,
  //     initBalanceB: this.initBalanceB,
  //     isA: this.isA,
  //     myKeyPair: this.myKeyPair,
  //     hisPublicKey: this.hisPublicKey,
  //   });
  // }
}
