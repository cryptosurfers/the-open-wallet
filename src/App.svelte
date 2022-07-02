<script lang="ts">
  import storage from '$lib/utils/storage';
  import { reductId, setClipboard } from '$lib/utils/strings';

  import { onMount } from 'svelte';
  import Button from './components/Button.svelte';
  import Input from './components/Input.svelte';
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
  let screen: 'WELCOME' | 'LOGIN' = 'WELCOME';
  let copied = false;
  let isChangePassword = false;

  let createStep: 1 | 2 | 3 = 1;
  const TonWeb = window.TonWeb;
  const providerUrl = 'https://testnet.toncenter.com/api/v2/jsonRPC'; // TON HTTP API url. Use this url for testnet
  const apiKey =
    '36a585cf3e99d3c844e448b495c7b2f66bd279d4f4782540e1cf01ffa8833c50';

  const walletVersion = 'v3R2';
  const ton = new TonWeb(new TonWeb.HttpProvider(providerUrl, { apiKey }));
  const tg = window.Telegram.WebApp;
  const nacl = TonWeb.utils.nacl;

  const loadInfo = async () => {
    const privateKey = await Controller.wordsToPrivateKey(myMnemonicWords);
    keyPair = nacl.sign.keyPair.fromSeed(
      TonWeb.utils.base64ToBytes(privateKey)
    );
    const WalletClass = ton.wallet.all[walletVersion];
    walletContract = new WalletClass(ton.provider, {
      publicKey: keyPair.publicKey,
      wc: 0,
    });
    wallet = (await walletContract.getAddress()).toString(true, true, true);

    const walletInfo = await ton.provider.getWalletInfo(wallet);
    walletBalance = controller.getBalance(walletInfo);
  };

  const onCreateClick = async () => {
    myMnemonicWords = await TonWeb.mnemonic.generateMnemonic();
    console.log(myMnemonicWords);

    await loadInfo();
    tg.sendData(
      JSON.stringify({
        wallet,
        publicKey: keyPair.publicKey,
        walletBalance,
        action: 'walletCreated',
      })
    );

    console.log(password);
  };

  const onConfirmPassword = async (pass: string) => {
    try {
      myMnemonicWords = await Controller.loadWords(pass);

      await loadInfo();
      tg.sendData(
        JSON.stringify({
          wallet,
          publicKey: keyPair.publicKey,
          walletBalance,
          action: 'login',
        })
      );
      passwordModalOpen = false;
      error = '';
    } catch (e) {
      error = 'ERROR';
    }
  };

  onMount(async () => {
    const words = await storage.getItem('words');
    if (words) {
      passwordModalOpen = true;
      screen = 'LOGIN';
    }
  });

  $: if (copied) {
    setTimeout(() => {
      copied = false;
    }, 2000);
  }
</script>

<main>
  <div class="error">{error}</div>
  {#if screen == 'LOGIN'}
    <div class="info-box">
      <p class="info">
        wallet: {reductId(wallet)}
        <i
          on:click={() => {
            setClipboard(wallet);
            copied = true;
          }}
          class="fa-solid fa-copy"
        />{#if copied}
          <span>Copied!</span>
        {/if}
      </p>

      <p class="info">balance: {walletBalance}</p>
    </div>

    {#if isChangePassword}
      <h2>Change Pin-Code</h2>
      <Input
        class="input"
        on:change={async (e) => {
          console.log(e);
          console.log(password);
        }}
        bind:value={password}
      />
    {/if}
    {#if isChangePassword}
      <Button
        wide
        type="accent"
        on:click={async () => {
          await Controller.saveWords(myMnemonicWords, password);
          password = '';
          isChangePassword = false;
        }}>Confirm Pin-Code</Button
      >
    {:else}
      <Button
        wide
        type="accent"
        on:click={() => {
          isChangePassword = true;
        }}>Change Pin-Code</Button
      >
    {/if}
    <Button
      type="default"
      wide
      on:click={() => {
        storage.clear();
        screen = 'WELCOME';
        createStep = 1;
      }}>Delete Wallet</Button
    >
  {:else}
    <div class="create-box">
      {#if createStep == 1}
        <h2>Welcome to the open wallet</h2>
        <Button
          wide
          type="accent"
          on:click={() => {
            createStep++;
          }}>Create Wallet</Button
        >
      {:else if createStep == 2}
        <h2>
          To create a wallet need to generate and write down a seed phrase.
        </h2>
        <p>Please memorize the phrase and keep it in a safe place.</p>
        <Button
          wide
          type="accent"
          on:click={async () => {
            await onCreateClick();
            createStep++;
          }}>Generate phrase</Button
        >
      {:else}
        <h2>
          <h2>Your phrase is:</h2>
          <div class="phrase">
            {#each myMnemonicWords as word, id}
              <span class="word">{id + 1}.{word} </span>
            {/each}
          </div>
        </h2>
        <h2>Please save phrase and setup your Pin-code and continue:</h2>
        <Input class="create" bind:value={password} />
        <Button
          on:click={async () => {
            await Controller.saveWords(myMnemonicWords, password);
            password = '';
            screen = 'LOGIN';
          }}
          type="accent"
          wide>Save pincode</Button
        >
      {/if}
    </div>
  {/if}

  <EnterPasswordModal
    confirmPassword={onConfirmPassword}
    open={passwordModalOpen}
  />
</main>

<style>
  .word {
    text-align: start;
  }
  .info {
    font-size: 20px;
    overflow-wrap: anywhere;
  }
  .phrase {
    display: grid;
    grid-template-columns: minmax(50px, 1fr) minmax(50px, 1fr);
  }
  .info-box {
  }
  .create-box {
    width: 100%;
  }
  .words {
    border: 1px solid black;
    width: 500px;
    overflow-wrap: anywhere;
  }
  .create {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  main {
    text-align: center;
    padding: 1em;

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
    font-size: 25px;
    position: absolute;
    z-index: 200;
    color: #d73e3eba;
  }
</style>
