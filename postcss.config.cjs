const tailwindcss = require('tailwindcss')
const autoprefixer = require('autoprefixer')
const postcssNested = require('postcss-nested')
const cssnano = require('cssnano')

const mode = process.env.NODE_ENV
const dev = mode === 'development'

module.exports = {
  plugins: [tailwindcss(), postcssNested(), autoprefixer(), !dev && cssnano({ preset: 'default' })]
}
