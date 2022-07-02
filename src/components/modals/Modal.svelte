<script lang="ts">
  import Portal from 'svelte-portal/src/Portal.svelte'
  import { fade } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher();

  export let z_index = 100
  export let empty = false
  export let emptyDesc = false
  export let title = ''
  export let open = false
  export let width = '40rem'
  export let fullScreen = false
  export let close: () => void = () => { 
    open = false; 
    dispatch('modalClosed');
  }
</script>

{#if open}
  <Portal>
    <div transition:fade={{ duration: 100 }} class="wrapper" style="--modal-width: {width}; z-index: {z_index};">
      <div class="overlay" on:click={close} />
      <div class="modal" class:full={fullScreen} class:modal--empty-desc={emptyDesc} class:modal--empty={empty}>
        <slot name="prepend" />
        <div>
          {#if title && !empty}
            <h2 class="title">{title}</h2>
          {/if}
          <slot />
        </div>
        {#if $$slots.controls}
          <div class="controls">
            <slot name="controls" />
          </div>
        {/if}
      </div>
    </div>
  </Portal>
{/if}

<style type="text/scss">
  .wrapper {
    color: black;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: #a4a8b0;
    opacity: 0.66;
  }

  .modal {
    overflow-y: auto;
    position: absolute;
    top: 50%;
    left: 50%;
    width: var(--modal-width);
    max-width: 95%;
    max-height: calc(100vh - 1rem);
    padding: 32px 16px;
    background-color: #fff;
    box-shadow: 0px 24px 48px rgba(38, 43, 63, 0.09);
    border-radius: 30px;
    transform: translate(-50%, -50%);

    @media (min-width: 768px) {
      padding: 32px;
    }

    .title {
      flex: 0 0 auto;
      margin: 0 0 32px;
      font-weight: 400;
      font-size: 30px;
      line-height: 42px;

      color: var(--total-black);
    }

    .controls {
      display: flex;
      justify-content: space-between;
      padding: 0 4rem;

      :global(button) {
        height: 5.6rem;
        width: calc(50% - 1.5rem);
      }

      :global(button.button--single) {
        width: 100%;
      }

      :global(button.button--cancel) {
        background-color: #fff;
        border: 1px solid #0191e0;
        color: #0191e0;
      }
    }
  }
  .modal.full {
    max-width: none;
    max-height: none;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;

    border-radius: 0;

    .title {
      text-align: center;
      margin: 32px 0 32px;
      font-size: 24px;
      font-weight: 700;
    }
  }
</style>
