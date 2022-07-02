<script lang="ts">
  import storage from '$lib/utils/storage';

  import { onMount } from 'svelte';
  import Button from './components/Button.svelte';
  import EnterPasswordModal from './components/modals/EnterPasswordModal.svelte';
  import Modal from './components/modals/Modal.svelte';
  import { controller, Controller } from './lib/Controller';
  export let name: string | string;

  let myMnemonicWords: string[] = [];
  let password = '';
  let passwordModalOpen = false;
  let error = '';
  let keyPair: any;
  let walletContract: any;
  let wallet: any;
  let walletBalance: any;
  const TonWeb = window.TonWeb;
  const providerUrl = 'https://testnet.toncenter.com/api/v2/jsonRPC'; // TON HTTP API url. Use this url for testnet
  const apiKey =
    '36a585cf3e99d3c844e448b495c7b2f66bd279d4f4782540e1cf01ffa8833c50';

  const walletVersion = 'v3R2';
  const ton = new TonWeb(new TonWeb.HttpProvider(providerUrl, { apiKey }));
  const tg = window.Telegram.WebApp;
  const nacl = TonWeb.utils.nacl;
  const onCreateClick = async () => {
    myMnemonicWords = await TonWeb.mnemonic.generateMnemonic();
    console.log(myMnemonicWords);

    console.log(password);
  };

  onMount(async () => {
    const words = await storage.getItem('words');
    if (words) passwordModalOpen = true;
  });

  const onConfirmPassword = async (pass: string) => {
    try {
      myMnemonicWords = await Controller.loadWords(pass);

      const privateKey = await Controller.wordsToPrivateKey(myMnemonicWords);
      keyPair = nacl.sign.keyPair.fromSeed(
        TonWeb.utils.base64ToBytes(privateKey)
      );
      console.log(keyPair);
      const WalletClass = ton.wallet.all[walletVersion];
      walletContract = new WalletClass(ton.provider, {
        publicKey: keyPair.publicKey,
        wc: 0,
      });
      wallet = (await walletContract.getAddress()).toString(true, true, true);
      console.log(wallet);
      
      const walletInfo = await ton.provider.getWalletInfo(wallet);
      walletBalance = controller.getBalance(walletInfo);
      tg.sendData(JSON.stringify({wallet, keyPair, walletBalance}))
      passwordModalOpen = false;
      error = '';
    } catch (e) {
      error = 'ERROR';
    }
  };
</script>

<main>
  <div class="error">{error}</div>
  {#if wallet}
    wallet: {wallet}
    balance: {walletBalance}
  {/if}
  <div>
    <h2>Create or import wallet</h2>

    {#if myMnemonicWords.length}
      <div class="words">{myMnemonicWords}</div>
    {/if}
    <Button type="accent" on:click={onCreateClick}>Create</Button><Button
      >Import</Button
    >
  </div>
  <h2>SetUp Password</h2>
  <input
    on:change={async (e) => {
      console.log(e);
      console.log(password);
    }}
    bind:value={password}
  />
  <Button
    type="accent"
    on:click={() => {
      Controller.saveWords(myMnemonicWords, password);
    }}>Confirm Pin-Code</Button
  >
  <EnterPasswordModal
    confirmPassword={onConfirmPassword}
    open={passwordModalOpen}
  />
</main>

<style>
  .words {
    border: 1px solid black;
    width: 500px;
    overflow-wrap: anywhere;
  }
  div {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }

  .error {
    position: absolute;
    z-index: 200;
    color: #d73e3eba;
  }
</style>
