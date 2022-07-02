<script lang="ts">
  import { Channel } from '$lib/channels';

  import { getQueryObject } from '$lib/utils/strings';

  import Button from '../Button.svelte';
  import Input from '../Input.svelte';
  import Modal from './Modal.svelte';

  export let open: boolean = false;
  export let myKeyPair: any;
  export let providerUrl: string = '';
  export let apiKey: string = '';
  const query = getQueryObject();

  let channel: any;
  $: if (myKeyPair?.publicKey && query.action == 'createPaymentChannel') {
    channel = new Channel(
      query.channelId!,
      query.addressA!,
      query.addressB!,
      query.initialBalanceA!,
      query.initialBalanceB!,
      query.isA!,
      myKeyPair,
      query.hisPublicKey,
      apiKey,
      providerUrl
    );

    console.log('channel', channel);
  }

  let error: string = '';
</script>

<Modal {open}>
  <h2>Sign Transaction</h2>

  <Button
    wide
    type="accent"
    on:click={() => {
      try {
        error = '';
      } catch (e) {
        error = 'ERROR';
      }
    }}>Confirm</Button
  >
  <div class="error">{error}</div>
</Modal>

<style></style>
