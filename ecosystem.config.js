module.exports = {
  apps: [{
    name: 'easeup-backend',
    script: 'index.js',
    watch: false,
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '500M',
    error_file: './error.log',
    out_file: './combined.log',
    merge_logs: true,
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],

  deploy: {
    production: {
      user: 'SSH_USERNAME',
      host: 'SSH_HOSTMACHINE',
      ref: 'origin/master',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
