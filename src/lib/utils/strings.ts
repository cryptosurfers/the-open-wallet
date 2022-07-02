export const reductId = (x: string | undefined) => x?.match(/^.{6}|.{4}$/g)?.join('...')

export const setClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
}
