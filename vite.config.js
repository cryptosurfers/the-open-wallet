import { sveltekit } from '@sveltejs/kit/vite'
import { resolve } from 'path'

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  resolve: {
    alias: {
      tonweb: resolve('./node_modules/tonweb/dist/tonweb.js')
    }
  }
}

export default config
