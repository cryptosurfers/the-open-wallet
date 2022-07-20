<script lang="ts">
  import { onMount } from 'svelte'

  import storage from '$lib/wallet/storage'
  import TheOpenProtocol from '$lib/webapp/webapp'
  import { Controller } from '$lib/wallet/controller'
  import { getQueryObject, reductId, setClipboard } from '$lib/utils/strings'
  import type { BotQuery } from '$lib/utils/strings'

  import Button from '$lib/components/Button.svelte'
  import Input from '$lib/components/Input.svelte'
  import ActionModal from '$lib/components/Modals/ActionModal.svelte'
  import EnterPasswordModal from '$lib/components/Modals/EnterPasswordModal.svelte'

  import TonWeb from 'tonweb'
  import { walletStore } from '$lib/stores/wallet'
  import { goto } from '$app/navigation'

  export let name: string | string

  let myMnemonicWords: string[] = []
  let password = ''
  let passwordModalOpen = false
  let isActionModalOpen = false
  let error = ''

  let wallet: any
  let walletBalance: any
  let screen: 'WELCOME' | 'LOGIN' = 'WELCOME'
  let copied = false
  let isChangePassword = false

  let createStep: 1 | 2 | 3 = 1

  $: keyPair = $walletStore.keyPair
  $: ton = $walletStore.ton
  const tonMnemonic = window.TonWeb.mnemonic

  const tg = window.Telegram.WebApp
  const nacl = TonWeb.utils.nacl

  //Load User info (e.g balance, ...)
  const loadInfo = async () => {
    const privateKey = await Controller.wordsToPrivateKey(myMnemonicWords)
    walletStore.setUserKeyPair(nacl.sign.keyPair.fromSeed(TonWeb.utils.base64ToBytes(privateKey)))

    wallet = (
      await ton.wallet
        .create({
          publicKey: keyPair?.publicKey
        })
        .getAddress()
    ).toString(true, true, true)

    const walletInfo = await ton.provider.getWalletInfo(wallet)
    walletBalance = TonWeb.utils.fromNano(await Controller.getBalance(walletInfo))
  }

  const onCreateClick = async () => {
    myMnemonicWords = await tonMnemonic.generateMnemonic()

    await loadInfo()
  }

  // excrypt mnemonic woth password and save local
  const onSavePassword = async () => {
    await Controller.saveWords(myMnemonicWords, password)
    password = ''
    screen = 'LOGIN'
    if (keyPair) {
      TheOpenProtocol.createWallet({
        params: {
          address: wallet,
          publicKey: keyPair.publicKey
        }
      })
    }
  }

  // decrypt mnemonic with password and load user info
  const onConfirmPassword = async (pass: string) => {
    try {
      myMnemonicWords = await Controller.loadWords(pass)

      await loadInfo()

      passwordModalOpen = false

      const queryObject = getQueryObject() as BotQuery
      if (queryObject.action == 'createPaymentChannel' || queryObject.action == 'topUpAndInitPaymentChannel') {
        isActionModalOpen = true
      }
      error = ''
    } catch (e) {
      error = 'ERROR'
    }
  }

  // check if user already has local wallet
  onMount(async () => {
    const words = await storage.getItem('words')
    if (words) {
      passwordModalOpen = true
      screen = 'LOGIN'
    }
  })

  $: if (copied) {
    setTimeout(() => {
      copied = false
    }, 2000)
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
              setClipboard(wallet)
              copied = true
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
            await Controller.saveWords(myMnemonicWords, password)
            password = ''
            isChangePassword = false
          }}>Confirm Pin-Code</Button
        >
      {:else}
        <Button
          wide
          type="accent"
          on:click={() => {
            isChangePassword = true
          }}>Change Pin-Code</Button
        >
      {/if}
    {/if}
    <Button
      type="default"
      wide
      on:click={async () => {
        if (keyPair)
          TheOpenProtocol.updateWallet({
            params: {
              address: wallet,
              publicKey: keyPair.publicKey
            }
          })

        screen = 'WELCOME'
        createStep = 1
      }}>Close</Button
    >
    <Button
      type="default"
      wide
      on:click={async () => {
        TheOpenProtocol.deleteWallet({
          params: {
            address: wallet,
            publicKey: keyPair?.publicKey
          }
        })

        storage.clear()
        screen = 'WELCOME'
        createStep = 1
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
            createStep++
          }}>Create Wallet</Button
        >
        <Button
          wide
          type="accent"
          on:click={() => {
            goto('./import')
          }}>Import</Button
        >
      {:else if createStep == 2}
        <h2>To create a wallet need to generate and write down a seed phrase.</h2>
        <p>Please memorize the phrase and keep it in a safe place.</p>
        <Button
          wide
          type="accent"
          on:click={async () => {
            await onCreateClick()
            createStep++
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
              e.preventDefault()
              onSavePassword()
            }
          }}
          class="create"
          bind:value={password}
        />
        <Button on:click={onSavePassword} type="accent" wide>Save pincode</Button>
      {/if}
    </div>
  {/if}
  <ActionModal open={isActionModalOpen} />
  <EnterPasswordModal confirmPassword={onConfirmPassword} open={passwordModalOpen} />
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
