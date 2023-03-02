module.exports = {
  apps: [
    {
      name: "rb",
      script: "./main.js",
      cron_restart: "15 0,12 * * *", // Restarts the app every day at 12:00 AM and 12:00 PM
      env: {
        TZ: "Asia/Manila" // Set the timezone to Asia/Manila
      },
      args: ["--max-old-space-size=2048"] // Increase heap size to 2048 MB
    }
  ]
}