<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' = 'md'
  export let value = ''
  export let readonly = false
  export let disabled = false
  export let placeholder: string | null = null
  export let validateOnBlur = false
  export let rules: any = []
  export let success = false
  export let style: any = null
  export let inputElement = null
  export let message = ''
  export let error = ''
  export let name = ''

  let className = $$props.class || $$props.className || ''

  let focused = false
  $: filled = !!value
  let errorMessages = []

  let hasError: boolean
  $: hasError = !!error

  let classes: string
  $: classes = [className, size, focused && 'focused', filled && 'filled'].filter((v) => v).join(' ')

  export function validate() {
    errorMessages = rules.map((r: any) => r(value)).filter((r: any) => typeof r === 'string')
    hasError = !!errorMessages.length || !!error
    return hasError
  }
  function onFocus() {
    focused = true
  }
  function onBlur() {
    focused = false
    if (validateOnBlur) validate()
  }
  function onInput() {
    if (!validateOnBlur) validate()
  }
</script>

<div class={classes} class:error class:success class:readonly class:disabled {style}>
  <div class="inp">
    <input
      type="text"
      bind:this={inputElement}
      bind:value
      {name}
      {placeholder}
      {readonly}
      {disabled}
      on:focus={onFocus}
      on:blur={onBlur}
      on:input={onInput}
      on:focus
      on:blur
      on:input
      on:change
      on:keypress
      on:keydown
      on:keyup
      autocomplete="off"
    />
  </div>
</div>

<style>
  .inp {
    border-radius: 10.5px;
    background-color: #f8f9fb;
  }
  .inp:hover {
    background-color: #f0f2f7;
  }

  input {
    border-radius: 10.5px;
    width: 100%;
    display: block;
    background-color: transparent;
  }
  input:focus-visible {
    outline: none;
  }

  .md input {
    padding: 14.5px 12px;
  }
</style>
