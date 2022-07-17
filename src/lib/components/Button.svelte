<script lang="ts">
  export let size: 'lg' | 'md' | 'sm' | 'xs' | 'xxs' = 'lg'
  export let type: 'default' | 'accent' = 'default'
  export let icon = ''
  export let label = ''
  export let width = ''
  export let wide = false
  export let loading = false
  export let disabled = false

  let className = $$props.class || $$props.className || ''
  let classes: string

  $: classes = [type, size, className, wide && 'wide', loading && 'loading', disabled && 'disabled']
    .filter((v) => v)
    .join(' ')
</script>

<button class={classes} style="width: {wide ? '' : width}" type="button" on:click on:keypress>
  <span>
    <slot />
  </span>
</button>

<style>
  .default {
    background-color: transparent;

    border-radius: 15px;
    border-width: 1px;
    border-color: rgb(255, 255, 255);
    font-weight: 400;
    font-style: normal;
    color: var(--tg-theme-text-color);
    font-size: 16px;
    letter-spacing: 0px;
    cursor: pointer;
    border-color: rgb(0, 153, 200);
  }
  .wide {
    width: 100%;
  }
  .default:hover {
    border-color: rgb(0, 153, 200);
  }
  .accent {
    background-color: var(--tg-theme-button-color);
    border-radius: 15px;
    border-width: 0px;
    border-color: rgb(0, 0, 0);
    font-weight: 400;
    font-style: normal;
    color: var(--tg-theme-button-text-color);
    font-size: 16px;
    letter-spacing: 0px;
    cursor: pointer;
  }
  .accent:hover {
    border-color: rgb(0, 153, 200);
  }

  .lg {
    padding-top: 16px;
    padding-bottom: 16px;
    padding-left: 26px;
    padding-right: 26px;
  }
</style>
