module.exports = {
  apps: [
    {
      "name": "rb",
      "script": "./main.js",
      "cron_restart": "15 0,12 * * *",
      "env": {
        "TZ": "Asia/Manila"
      },
      "interpreter_args": ["--max-old-space-size=4096"]
    }    
  ]
}