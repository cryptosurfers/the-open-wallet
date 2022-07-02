<script lang="ts">
  import Button from '../Button.svelte';
  import Input from '../Input.svelte';
  import Modal from './Modal.svelte';

  export let confirmPassword: (pass: string) => void;
  export let open: boolean = false;

  let password: string = '';
  let error: string = '';
</script>

<Modal {open}>
  <h2>Enter your password</h2>
  <Input
    on:keypress={(e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirmPassword(password);
      }
    }}
    bind:value={password}
  />
  <Button
    wide
    type="accent"
    on:keypress={(e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirmPassword(password);
      }
    }}
    on:click={() => {
      try {
        confirmPassword(password);
        error = '';
      } catch (e) {
        error = 'ERROR';
      }
    }}>Confirm</Button
  >
  <div class="error">{error}</div>
</Modal>

<style></style>
