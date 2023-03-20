module.exports = {
  apps: [
    {
      "name": "rb",
      "script": "./main.js",
      "cron_restart": "0 */3 * * *",
      "env": {
        "TZ": "Asia/Manila"
      },
      "interpreter_args": ["--max-old-space-size=4096"],
      "restart_delay": "10000",
      "max_memory_restart": "4G"
    }    
  ]
}