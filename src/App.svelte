<script lang="ts">
  import { onMount } from 'svelte';
  import { Controller } from './lib/Controller';
  export let name: string | string;

  let myMnemonicWords: string[] = [];
  let password = '';
  const TonWeb = window.TonWeb;

  const onCreateClick = async () => {
    myMnemonicWords = await TonWeb.mnemonic.generateMnemonic();
    console.log(myMnemonicWords);
    Controller.saveWords(myMnemonicWords, password);
    console.log(password);
  };

  onMount(async () => {
    myMnemonicWords = await Controller.loadWords(password);
  });
</script>

<main>
  <div>
    <h2>Create or import wallet</h2>

    {#if myMnemonicWords.length}
      <div class="words">{myMnemonicWords}</div>
    {/if}
    <button on:click={onCreateClick}>Create</button><button>Import</button>
  </div>
  <h2>Enter Password</h2>
  <input
    on:change={async (e) => {
			console.log(e)
			console.log(password)
      myMnemonicWords = await Controller.loadWords(password);
    }}
    bind:value={password}
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
</style>
