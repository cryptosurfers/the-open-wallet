<script lang="ts">
  import { fade } from 'svelte/transition'
  import { tick, createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let target: string = 'body'
  export let z_index = 100
  export let title = ''
  export let open = false
  export let width = '40rem'
  export let full = false
  export let closeOnOutsideClick = true
  export let close: () => void = () => {
    open = false
    dispatch('close')
  }

  const constructor = (
    el: HTMLElement
  ): {
    destroy: () => void
  } => {
    document?.querySelector(target)?.appendChild(el)

    return {
      destroy() {
        if (el.parentNode) {
          el.parentNode.removeChild(el)
        }
      }
    }
  }
</script>

{#if open}
  <div
    use:constructor
    transition:fade={{ duration: 100 }}
    class="wrapper"
    style="--modal-width: {width}; z-index: {z_index};"
  >
    <div class="overlay" on:click={() => closeOnOutsideClick && close()} />

    <div class="modal" class:full>
      <header class="mb-4 flex justify-between items-center">
        <h2 class="title">{title}</h2>
        <button class="block h-4 w-4 rounded-3xl border-0 bg-no-repeat bg-cover bg-cross" on:click={close} />
      </header>

      <slot />

      {#if $$slots.controls}
        <slot name="controls" />
      {/if}
    </div>
  </div>
{/if}

<style lang="postcss">
  .wrapper {
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
      font-weight: 400;
      font-size: 30px;
      line-height: 42px;

      color: var(--total-black);
    }
  }
  .modal.full {
    max-width: none;
    max-height: none;
    height: 100%;
    width: 100%;
    border-radius: 0;

    .title {
      text-align: center;
      margin: 32px 0 32px;
      font-size: 24px;
      font-weight: 700;
    }
  }
</style>
