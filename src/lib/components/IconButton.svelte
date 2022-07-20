<script>
  export let size = 'md'
  export let type = 'default'
  export let icon = ''
  export let iconClass = ''
  export let iconUrl = ''
  export let loading = false
  export let disabled = false
  let className = $$props.class || $$props.className || ''
  let classes = ''
  $: classes = [type, size, className, loading && 'loading', disabled && 'disabled'].filter((v) => v).join(' ')
</script>

<button class={classes} type="button" on:click>
  {#if iconClass}
    <i class={iconClass} />
  {:else if iconUrl}
    <i style="background-image: url({iconUrl})" />
  {/if}
</button>

<style>
  button {
    position: relative;
    display: inline-flex;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 0px;
    vertical-align: top;
    transition-property: color, background-color, border-color, fill, stroke, -webkit-text-decoration-color;
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke,
      -webkit-text-decoration-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }

  button.disabled {
    pointer-events: none;
  }

  button.disabled:after {
    display: none;
  }

  svg {
    position: relative;
    z-index: 1;
    display: block;
  }

  i {
    position: relative;
    z-index: 1;
    display: block;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
  }

  .lg {
    height: 60px;
    width: 60px;
    border-radius: 1.125rem;
  }

  .lg:after {
    border-radius: 1.125rem;
  }

  .lg svg,
  .lg i {
    height: 1.5rem;
  }

  .lg svg,
  .lg i {
    width: 1.5rem;
  }

  .md {
    height: 3rem;
    width: 3rem;
    border-radius: 0.9375rem;
    font-size: 1.125rem;
    line-height: 1.5rem;
  }

  .md:after {
    border-radius: 0.9375rem;
  }

  .md svg,
  .md i {
    height: 1.125rem;
  }

  .md svg,
  .md i {
    width: 1.125rem;
  }

  .sm {
    height: 42px;
    width: 42px;
    border-radius: 0.9375rem;
  }

  .sm:after {
    border-radius: 0.9375rem;
  }

  .sm svg,
  .sm i {
    height: 1.125rem;
  }

  .sm svg,
  .sm i {
    width: 1.125rem;
  }

  .xs {
    height: 2.25rem;
    width: 2.25rem;
    border-radius: 0.75rem;
  }

  .xs:after {
    border-radius: 0.75rem;
  }

  .xs svg,
  .xs i {
    height: 1.125rem;
  }

  .xs svg,
  .xs i {
    width: 1.125rem;
  }

  .xxs {
    height: 30px;
    width: 30px;
    border-radius: 0.75rem;
  }

  .xxs:after {
    border-radius: 0.75rem;
  }

  .xxs svg,
  .xxs i {
    height: 1.125rem;
  }

  .xxs svg,
  .xxs i {
    width: 1.125rem;
  }

  .default {
    --tw-bg-opacity: 1;
    background-color: rgb(248 249 251 / var(--tw-bg-opacity));
    transition-property: color, background-color, border-color, fill, stroke, -webkit-text-decoration-color;
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke,
      -webkit-text-decoration-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }

  .default:hover {
    --tw-bg-opacity: 1;
    background-color: rgb(240 242 247 / var(--tw-bg-opacity));
  }

  .default svg {
    fill: currentColor;
  }

  .default.disabled {
    --tw-bg-opacity: 1;
    background-color: rgb(255 255 255 / var(--tw-bg-opacity));
  }

  .default.disabled {
    background-image: none;
  }

  .default.disabled {
    --tw-text-opacity: 1;
    color: rgb(199 200 203 / var(--tw-text-opacity));
  }

  .default.disabled {
    --tw-shadow: 0 0 1px 1px #e2e4e9 inset;
    --tw-shadow-colored: inset 0 0 1px 1px var(--tw-shadow-color);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  }

  .default.disabled svg {
    fill: currentColor;
  }

  .accent {
    background-image: linear-gradient(247.82deg, #5872ff 35.52%, #a258ff 161.03%);
    --tw-text-opacity: 1;
    color: rgb(255 255 255 / var(--tw-text-opacity));
  }

  .accent:after {
    position: absolute;
  }

  .accent:after {
    top: 0px;
  }

  .accent:after {
    left: 0px;
  }

  .accent:after {
    display: block;
  }

  .accent:after {
    height: 100%;
  }

  .accent:after {
    width: 100%;
  }

  .accent:after {
    background-image: linear-gradient(233.45deg, #d389a8 0.01%, #9687f0 78.71%);
  }

  .accent:after {
    opacity: 0;
  }

  .accent:after {
    transition-property: opacity;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }

  .accent:after {
    content: '';
  }

  .accent:hover:after {
    opacity: 1;
  }

  .accent svg {
    fill: currentColor;
  }

  .accent.disabled {
    background-image: none;
  }

  .accent.disabled {
    --tw-text-opacity: 1;
    color: rgb(199 200 203 / var(--tw-text-opacity));
  }

  .accent.disabled {
    --tw-shadow: 0 0 1px 1px #e2e4e9 inset;
    --tw-shadow-colored: inset 0 0 1px 1px var(--tw-shadow-color);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  }

  .accent.disabled svg {
    fill: currentColor;
  }

  .outlined {
    --tw-bg-opacity: 1;
    background-color: rgb(255 255 255 / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgb(43 44 46 / var(--tw-text-opacity));
    --tw-shadow: 0 0 1px 1px #e2e4e9 inset;
    --tw-shadow-colored: inset 0 0 1px 1px var(--tw-shadow-color);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  }

  .outlined:hover {
    --tw-bg-opacity: 1;
    background-color: rgb(240 242 247 / var(--tw-bg-opacity));
  }

  .outlined svg {
    fill: currentColor;
  }

  .outlined.disabled {
    background-image: none;
  }

  .outlined.disabled {
    --tw-text-opacity: 1;
    color: rgb(199 200 203 / var(--tw-text-opacity));
  }

  .outlined.disabled {
    --tw-shadow: 0 0 1px 1px #e2e4e9 inset;
    --tw-shadow-colored: inset 0 0 1px 1px var(--tw-shadow-color);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  }

  .outlined.disabled svg {
    fill: currentColor;
  }

  .ghost {
    background-color: transparent;
    --tw-text-opacity: 1;
    color: rgb(186 189 193 / var(--tw-text-opacity));
    transition-property: color, background-color, border-color, fill, stroke, -webkit-text-decoration-color;
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke,
      -webkit-text-decoration-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }

  .ghost:hover {
    --tw-bg-opacity: 1;
    background-color: rgb(240 242 247 / var(--tw-bg-opacity));
  }

  .ghost:hover {
    --tw-text-opacity: 1;
    color: rgb(43 44 46 / var(--tw-text-opacity));
  }

  .ghost:hover svg {
    fill: currentColor;
  }

  .ghost svg {
    fill: currentColor;
  }

  .ghost svg {
    transition-property: color, background-color, border-color, fill, stroke, -webkit-text-decoration-color;
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke,
      -webkit-text-decoration-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }

  .ghost.disabled {
    background-image: none;
  }

  .ghost.disabled {
    --tw-text-opacity: 1;
    color: rgb(199 200 203 / var(--tw-text-opacity));
  }

  .ghost.disabled {
    --tw-shadow: 0 0 1px 1px #e2e4e9 inset;
    --tw-shadow-colored: inset 0 0 1px 1px var(--tw-shadow-color);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  }

  .ghost.disabled svg {
    fill: currentColor;
  }
</style>
