import TonWeb from '../../node_modules/tonweb/dist/tonweb';

export class Channel {
  ton: any;
  channel: any;
  fromWallet: any;
  wallet: any;
  constructor(
    public channelId: number, // Channel ID, for each new channel there must be a new ID
    public addressA: string, // A's funds will be withdrawn to this wallet address after the channel is closed
    public addressB: string, // B's funds will be withdrawn to this wallet address after the channel is closed
    public initBalanceA: string,
    public initBalanceB: string,
    public isA: boolean,
    public myKeyPair: any,
    public hisPublicKey: any,
    public apiKey: string,
    public providerUrl: string
  ) {
    this.channelId = channelId;
    this.addressA = addressA;
    this.addressB = addressB;
    this.initBalanceA = initBalanceA;
    this.initBalanceB = initBalanceB;
    this.isA = isA;
    this.myKeyPair = myKeyPair;
    this.hisPublicKey = hisPublicKey;
    this.ton = new TonWeb(new TonWeb.HttpProvider(providerUrl, { apiKey }));
    this.channel = this.ton.payments.createChannel({
      channelId,
      addressA,
      addressB,
      initBalanceA,
      initBalanceB,
      isA,
      myKeyPair,
      hisPublicKey,
    });
    this.wallet = this.ton.wallet.create({
      publicKey: myKeyPair?.publicKey,
    });
    this.fromWallet = this.channel.fromWallet({
      wallet: this.wallet,
      secretKey: myKeyPair?.secretKey,
    });
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
