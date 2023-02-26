module.exports = {
  apps: [
    {
      name: "rb",
      script: "./main.js",
      cron_restart: "15 0,12 * * *", // Restarts the app every day at 12:00 AM and 12:00 PM
      env: {
        TZ: "Asia/Manila" // Set the timezone to Asia/Manila
      }
    },
    {
      name: "scd",
      script: "./scheduler.js",
      cron_restart: "0 5 * * *", // Restarts the app at 5:00 AM every day
      cron_stop: "0 17 * * *", // Stops the app at 5:00 PM every day
      env: {
        TZ: "Asia/Manila" // Set the timezone to Asia/Manila
      }
    }
  ]
}