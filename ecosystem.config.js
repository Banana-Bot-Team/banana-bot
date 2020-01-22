module.exports = {
  apps: [{
    name: 'banana-bot',
    script: 'ts-node',
    args: 'index.ts',
    autorestart: true,
    source_map_support: true,
    watch: ['index.ts', 'commands/**/*','data/**/*','utilities/**/*', 'cron/**/*', '.env'],
    ignore_watch: ["cron\/.+\.png"]
  }]
}