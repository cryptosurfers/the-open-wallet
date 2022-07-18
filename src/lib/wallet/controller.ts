import TonWeb from 'tonweb'
import storage from '$lib/wallet/storage'

const BN = TonWeb.utils.BN
const nacl = TonWeb.utils.nacl
const Address = TonWeb.utils.Address
const formatNanograms = TonWeb.utils.fromNano
const tonMnemonic = window.TonWeb.mnemonic


/**
 * @param plaintext {string}
 * @param password {string}
 * @return {Promise<string>}
 */
export async function encrypt(plaintext: string, password: string) {
  const pwUtf8 = new TextEncoder().encode(password) // encode password as UTF-8
  const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8) // hash the password

  const iv = crypto.getRandomValues(new Uint8Array(12)) // get 96-bit random iv

  const alg = { name: 'AES-GCM', iv: iv } // specify algorithm to use

  const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']) // generate key from pw

  const ptUint8 = new TextEncoder().encode(plaintext) // encode plaintext as UTF-8
  const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8) // encrypt plaintext using key

  const ctArray = Array.from(new Uint8Array(ctBuffer)) // ciphertext as byte array
  const ctStr = ctArray.map((byte) => String.fromCharCode(byte)).join('') // ciphertext as string
  const ctBase64 = btoa(ctStr) // encode ciphertext as base64

  const ivHex = Array.from(iv)
    .map((b) => ('00' + b.toString(16)).slice(-2))
    .join('') // iv as hex string

  return ivHex + ctBase64 // return iv+ciphertext
}

/**
 * @param ciphertext {string}
 * @param password {string}
 * @return {Promise<string>}
 */
export async function decrypt(ciphertext: string, password: string) {
  const pwUtf8 = new TextEncoder().encode(password) // encode password as UTF-8
  const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8) // hash the password

  const iv = ciphertext
    .slice(0, 24)
    .match(/.{2}/g)!
    .map((byte) => parseInt(byte, 16)) // get iv from ciphertext

  const alg = { name: 'AES-GCM', iv: new Uint8Array(iv) } // specify algorithm to use

  const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']) // use pw to generate key

  const ctStr = atob(ciphertext.slice(24)) // decode base64 ciphertext
  const ctUint8 = new Uint8Array(ctStr.match(/[\s\S]/g)!.map((ch) => ch.charCodeAt(0))) // ciphertext as Uint8Array
  // note: why doesn't ctUint8 = new TextEncoder().encode(ctStr) work?

  const plainBuffer = await crypto.subtle.decrypt(alg, key, ctUint8) // decrypt ciphertext using key
  const plaintext = new TextDecoder().decode(plainBuffer) // decode password from UTF-8

  return plaintext // return the plaintext
}

export class Controller {
  /**
   * @param words {string[]}
   * @return {Promise<string>}
   */
  static async wordsToPrivateKey(words: string[]) {
    const keyPair = await tonMnemonic.mnemonicToKeyPair(words)
    return TonWeb.utils.bytesToBase64(keyPair.secretKey.slice(0, 32))
  }

  /**
   * @param words {string[]}
   * @param password  {string}
   * @return {Promise<void>}
   */
  static async saveWords(words: string[], password: string) {
    await storage.setItem('words', await encrypt(words.join(','), password))
  }

  /**
   * @param password  {string}
   * @return {Promise<string[]>}
   */
  static async loadWords(password: string) {
    return (await decrypt(await storage.getItem('words')!, password)).split(',')
  }

  static async getBalance(getWalletResponse: any) {
    return new BN(getWalletResponse.balance)
  }
}
