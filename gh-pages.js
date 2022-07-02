const ghpages = require('gh-pages');

ghpages.publish(
 'public', // path to public directory
 {
  branch: 'gh-pages',
  repo: 'https://github.com/cryptosurfers/the-open-wallet.git', // Update to point to your repository
  user: {
   name: 'faintsmi1e', // update to use your name
   email: 'zonest_64@mail.ru' // Update to use your email
  },
  dotfiles: true
  },
  () => {
   console.log('Deploy Complete!');
  }
);