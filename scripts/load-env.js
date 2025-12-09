// Load environment variables from .env file
require('dotenv').config({ quiet: true });

// Make environment variables available to Hexo
hexo.extend.filter.register('before_generate', function() {
  this.config.github_token = process.env.GITHUB_TOKEN;
});
