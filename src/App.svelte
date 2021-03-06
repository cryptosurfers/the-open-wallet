<script lang="ts">
  import storage from '$lib/utils/storage';
  import {
    BotQuery,
    getQueryObject,
    reductId,
    setClipboard,
  } from '$lib/utils/strings';

  import { onMount } from 'svelte';
  import Button from './components/Button.svelte';
  import Input from './components/Input.svelte';
  import ActionModal from './components/modals/ActionModal.svelte';
  import EnterPasswordModal from './components/modals/EnterPasswordModal.svelte';
  import TonWeb from '../node_modules/tonweb/dist/tonweb';
  import { controller, Controller } from './lib/Controller';
  export let name: string | string;

  let myMnemonicWords: string[] = [];
  let password = '';
  let passwordModalOpen = false;
  let isActionModalOpen = false;
  let error = '';
  let keyPair: any;

  let wallet: any;
  let walletBalance: any;
  let screen: 'WELCOME' | 'LOGIN' = 'WELCOME';
  let copied = false;
  let isChangePassword = false;

  let createStep: 1 | 2 | 3 = 1;

  const providerUrl = 'https://testnet.toncenter.com/api/v2/jsonRPC'; // TON HTTP API url. Use this url for testnet
  const apiKey =
    '36a585cf3e99d3c844e448b495c7b2f66bd279d4f4782540e1cf01ffa8833c50';
  const OldTon = window.TonWeb;

  const ton = new TonWeb(new TonWeb.HttpProvider(providerUrl, { apiKey }));

  const tg = window.Telegram.WebApp;
  const nacl = TonWeb.utils.nacl;

  //Load User info (e.g balance, ...)
  const loadInfo = async () => {
    const privateKey = await Controller.wordsToPrivateKey(myMnemonicWords);
    keyPair = nacl.sign.keyPair.fromSeed(
      TonWeb.utils.base64ToBytes(privateKey)
    );

    wallet = (
      await ton.wallet
        .create({
          publicKey: keyPair.publicKey,
        })
        .getAddress()
    ).toString(true, true, true);

    const walletInfo = await ton.provider.getWalletInfo(wallet);
    walletBalance = TonWeb.utils.fromNano(
      await controller.getBalance(walletInfo)
    );
  };

  const onCreateClick = async () => {
    myMnemonicWords = await OldTon.mnemonic.generateMnemonic();

    await loadInfo();
  };

  // excrypt mnemonic woth password and save local
  const onSavePassword = async () => {
    await Controller.saveWords(myMnemonicWords, password);
    password = '';
    screen = 'LOGIN';
    tg.sendData(
      JSON.stringify({
        wallet,
        publicKey: keyPair.publicKey,
        walletBalance,
        action: 'walletCreated',
      })
    );
  };

  // decrypt mnemonic with password and load user info
  const onConfirmPassword = async (pass: string) => {
    try {
      myMnemonicWords = await Controller.loadWords(pass);

      await loadInfo();

      passwordModalOpen = false;

      const queryObject = getQueryObject() as BotQuery;
      if (
        queryObject.action == 'createPaymentChannel' ||
        queryObject.action == 'topUpAndInitPaymentChannel'
      ) {
        isActionModalOpen = true;
      }
      error = '';
    } catch (e) {
      error = 'ERROR';
    }
  };

  // check if user already has local wallet
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
    <h2>The Open Wallet</h2>

    {#if wallet}
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

        <p class="info">balance: {walletBalance ?? 'Loading...'}</p>
      </div>
      {#if isChangePassword}
        <h2>Change Pin-Code</h2>
        <Input class="input" bind:value={password} />
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
    {/if}
    <Button
      type="default"
      wide
      on:click={async () => {
        await tg.sendData(
          JSON.stringify({
            wallet,
            publicKey: keyPair?.publicKey,
            walletBalance,
            action: 'walletUpdated',
          })
        );
        //storage.clear();
        screen = 'WELCOME';
        createStep = 1;
      }}>Close</Button
    >
    <Button
      type="default"
      wide
      on:click={async () => {
        await tg.sendData(
          JSON.stringify({
            wallet,
            publicKey: keyPair?.publicKey,
            walletBalance,
            action: 'walletDeleted',
          })
        );
        storage.clear();
        screen = 'WELCOME';
        createStep = 1;
      }}>Disconnect and Forget Wallet</Button
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
        <Input
          on:keypress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSavePassword();
            }
          }}
          class="create"
          bind:value={password}
        />
        <Button on:click={onSavePassword} type="accent" wide
          >Save pincode</Button
        >
      {/if}
    </div>
  {/if}
  <ActionModal
    {apiKey}
    {providerUrl}
    myKeyPair={keyPair}
    open={isActionModalOpen}
  />
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
    color: #cf2626;
  }
</style>
