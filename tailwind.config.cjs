const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    // Getway theme configuration
    colors: {
      general: '#f0f2f6', // Main background
      copyright: '#5c5f65', // Footer copyright
      transparent: 'transparent',
      current: 'currentColor',
      black: '#2b2c2e', // Total black
      white: '#ffffff', // Total white
      'gray-medium': '#a4a8b0', // Gray — Medium
      'gray-ghost': '#babdc1', // Gray — Ghost button icon color
      'gray-disabled': '#c7c8cb', // Gray — Disabled Items
      'gray-light': '#d6d8dd', // Gray — Light
      'gray-dark': '#505561', // Gray — Dark
      'gray-stroke': '#e2e4e9', // Gray — Stroke
      'gray-dividers': '#ebf0f5', // Gray — Dividers
      'gray-hover': '#f0f2f7', // Gray — Hover, secondary
      'gray-hover-main': '#f8f9fb', // Gray — BG, hover
      highlight: '#fff5dc', // Light Yellow
      info: '#f4f3fe', // Light Yellow
      accent: '#415eff', // Main accent
      attention: '#ff6b74', // Attention
      'coins-btc': '#dab226', // Coins - Bitcoin
      focused: '#5872ff' //
    },
    extend: {
      colors: colors,
      fontFamily: {
        euclid: ['"Euclid Circular B"', '"Euclid Circular"', 'Helvetica', 'Arial', 'sans-serif']
      },
      fontSize: {
        H1: ['3.25rem', '3.875rem'], // 52/62
        'H1-mob': ['1.875rem', '2.375rem'], // 30/38
        H2: ['2.50rem', '3.250rem'], // 40/52
        'H2-mob': ['1.50rem', '1.875rem'], // 24/30
        H3: ['1.75rem', '2.250rem'], // 28/36
        H4: ['1.25rem', '1.750rem'], // 20/28
        H5: ['1.00rem', '1.625rem'], // 16/26
        'body-l': ['1.125rem', '1.875rem'], // 18/30
        'body-m': ['1.00rem', '1.625rem'], // 16/26
        'body-s': ['.875rem', '1.500rem'], // 14/24
        'body-xs': ['0.75rem', '1.250rem'] // 12/20
      }
    },
    backgroundImage: {
      'token-usdc': "url('/icons/tokens/usdc.svg')",
      'token-usdt': "url('/icons/tokens/usdt.svg')",
      'burger-open': "url('/icons/header/burger_open.svg')",
      'burger-close': "url('/icons/header/burger_close.svg')",
      logo: "url('/icons/header/logo.svg')",
      logout: "url('/icons/header/logout.svg')",
      'icon-email-blue': "url('/icons/blue/email.svg')",
      'icon-telegram-blue': "url('/icons/blue/telegram.svg')",
      'icon-discord-blue': "url('/icons/blue/discord.svg')",
      'icon-twitter-blue': "url('/icons/blue/twitter.svg')",
      'grad-main': 'linear-gradient(247.82deg, #5872ff 35.52%, #a258ff 161.03%)', // Main Gradient
      'grad-second': 'linear-gradient(233.45deg, #D389A8 0.01%, #9687F0 78.71%)', // Secondary Gradient
      'arrow-down': "url('/icons/arrow-down.svg')",
      'arrow-right': "url('/icons/arrow-right.svg')",
      'double-check': "url('/icons/double-check.svg')",
      chain: "url('/icons/chain.svg')",
      alarm: "url('/icons/alarm.svg')",
      cross: "url('/icons/cross.svg')"
    },
    fontFamily: {
      euclid: ['Euclid Circular', 'Arial', 'sans-serif']
    }
  },
  plugins: []
}
