module.exports = {
  apps: [
    // Frontend Vite server (port 3000)
    {
      name: 'codecraft-frontend',
      script: './node_modules/.bin/vite',
      args: '--host 0.0.0.0 --port 3000',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true
    },
    // Backend Hono API server (port 8787)
    {
      name: 'codecraft-backend',
      script: './node_modules/.bin/tsx',
      args: 'server.ts',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        PORT: 8787
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true
    }
  ]
}
