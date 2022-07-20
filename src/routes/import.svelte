<script lang="ts">
  import IconButton from '$lib/components/IconButton.svelte'
  import Button from '$lib/components/Button.svelte'
  import TheOpenProtocol from '$lib/webapp/webapp'
  import { Controller } from '$lib/wallet/controller'
  import { walletStore } from '$lib/stores/wallet'
  import TonWeb from 'tonweb'

  const nacl = TonWeb.utils.nacl
  export let initWords = Array.from(Array(24).keys()).map((i) => {
    return {
      position: i,
      value: '',
      isEditing: false
    }
  })

  let input: HTMLInputElement
</script>

<div class="phrase">
  {#each initWords as word}
    <span class="flex items-center ">
      <span class="mr-3">{word.position + 1 + '.'}</span>
      {#if !word.isEditing}
        {word.value}
        <IconButton
          iconClass="icon-edit"
          size={'xs'}
          type="ghost"
          on:click={() => {
            word.isEditing = true
            word.isEditing = true
            setTimeout(() => {
              input.focus()
            })
          }}
        />
      {:else}
        <span>
          <input
            bind:this={input}
            class="outline-none"
            bind:value={word.value}
            size={word.value ? word.value?.length + 1 : 8}
            maxlength="24"
            spellcheck="false"
          />
        </span>
        <IconButton
          iconClass="icon-check"
          size={'xs'}
          type="ghost"
          on:click={() => {
            word.isEditing = false
          }}
        />
        <IconButton
          iconClass="icon-close"
          size={'xs'}
          type="ghost"
          on:click={() => {
            word.value = ''
            word.isEditing = false
          }}
        />
      {/if}
    </span>
  {/each}
</div>
<Button
  wide
  type="accent"
  on:click={async () => {
    const mnemonic = initWords.map((word) => word.value)
    const privateKey = await Controller.wordsToPrivateKey(mnemonic)
    walletStore.setUserKeyPair(nacl.sign.keyPair.fromSeed(TonWeb.utils.base64ToBytes(privateKey)))

    let wallet = (
      await $walletStore.ton.wallet
        .create({
          publicKey: $walletStore.keyPair?.publicKey
        })
        .getAddress()
    ).toString(true, true, true)
    if ($walletStore.keyPair) {
      TheOpenProtocol.createWallet({
        params: {
          address: wallet,
          publicKey: $walletStore.keyPair.publicKey
        }
      })
    }
  }}>Confirm</Button
>

<style lang="postcss">
  .phrase {
    display: grid;
    grid-template-columns: minmax(50px, 1fr) minmax(50px, 1fr);
  }
</style>
