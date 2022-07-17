<script lang="ts">
  import { Channel } from '$lib/wallet/channels'

  import { getQueryObject } from '$lib/utils/strings'

  import Button from '../Button.svelte'

  import TonWeb from 'tonweb'

  import Modal from './Modal.svelte'

  export let open: boolean = false
  export let myKeyPair: any
  export let providerUrl: string = ''
  export let apiKey: string = ''
  const tonweb = new TonWeb(new TonWeb.HttpProvider(providerUrl, { apiKey }))
  const query = getQueryObject()
  const BN = TonWeb.utils.BN
  const toNano = TonWeb.utils.toNano
  const tg = window.Telegram.WebApp

  let channel: Channel
  let error = ''

  // create channel instance with data from bot
  async function getChannel() {
    if (myKeyPair?.publicKey && query.action) {
      const hisPublicKey = query.hisPublicKey
        .slice(1, query.hisPublicKey.length - 1)
        .split(', ')
        .map((int: string) => Number(int))

      channel = new Channel(
        new BN(query.channelId!),
        await tonweb.wallet
          .create({
            publicKey: query.isA! == 'True' ? myKeyPair.publicKey : hisPublicKey
          })
          .getAddress(),
        // await new WalletClass(tonweb.provider, {
        //   publicKey: query.isA! == 'True' ? myKeyPair.publicKey : hisPublicKey,
        //   wc: 0,
        // }).getAddress(),
        await tonweb.wallet
          .create({
            publicKey: query.isA! == 'True' ? hisPublicKey : myKeyPair.publicKey
          })
          .getAddress(),
        new BN(query.initialBalanceA!),
        new BN(query.initialBalanceB!),
        query.isA! == 'True',
        myKeyPair,
        hisPublicKey,
        apiKey,
        providerUrl
      )
    }
  }
  let createLoading = false

  //action for user A
  const createPaymentChannel = async () => {
    try {
      await getChannel()
      createLoading = true

      await channel.fromWallet.deploy().send(toNano('0.05'))

      const res = await channel.fromWallet
        .topUp({ coinsA: new BN(channel.initBalanceA), coinsB: new BN(0) })
        .send(new BN(channel.initBalanceA).add(toNano('0.05')))
      const channelAddress = (await channel.channel.getAddress()).toString(true, true, true)

      if (res) {
        tg.sendData(
          JSON.stringify({
            channelAddress,
            action: 'paymentChannelCreated'
          })
        )
      }
    } catch (e: any) {
      error = e
      console.log(e)
    } finally {
      createLoading = false
    }
  }

  let topUpLoading = false

  // action for user B
  const topUpAndInitPaymentChannel = async () => {
    try {
      await getChannel()
      topUpLoading = true

      const res = await channel.fromWallet
        .topUp({ coinsA: new BN(channel.initBalanceA), coinsB: new BN(0) })
        .send(new BN(channel.initBalanceA).add(toNano('0.05')))
      const initRes = await channel.fromWallet
        .init({
          balanceA: channel.initBalanceA, // A's initial balance in Toncoins. Next A will need to make a top-up for this amount
          balanceB: channel.initBalanceB, // B's initial balance in Toncoins. Next B will need to make a top-up for this amount
          seqnoA: new BN(0), // initially 0
          seqnoB: new BN(0)
        })
        .send(toNano('0.05'))
      const channelAddress = (await channel.channel.getAddress()).toString(true, true, true)

      if (initRes) {
        tg.sendData(
          JSON.stringify({
            channelId: query.channelId,
            channelAddress,
            action: 'paymentChannelInited'
          })
        )
      }
    } catch (e: any) {
      error = e
      console.log(e)
    } finally {
      topUpLoading = false
    }
  }
</script>

<Modal {open}>
  <h2>Sign Transaction</h2>
  <p>
    channelId: {query?.channelId} action: {query?.action == 'createPaymentChannel'
      ? 'create channel'
      : 'confirm channel'}
  </p>
  <p>
    {#if query?.action == 'createPaymentChannel'}
      Sign The Open Channel Transaction(~0.05 TON)
    {:else if query?.action == 'topUpAndInitPaymentChannel'}
      Confirm and Init Channel with Id: {query?.channelId}
    {:else}
      sign transaction
    {/if}
  </p>
  {#if error}
    <p class="error">{error}</p>
  {/if}
  <Button
    wide
    type="accent"
    on:click={() => {
      if (query.action == 'createPaymentChannel') {
        createPaymentChannel()
      } else if (query.action == 'topUpAndInitPaymentChannel') {
        topUpAndInitPaymentChannel()
      }
    }}>{createLoading || topUpLoading ? 'Loading...' : 'Confirm'}</Button
  >
</Modal>

<style>
  .error {
    color: red;
  }
</style>
