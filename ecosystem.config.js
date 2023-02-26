module.exports = {
  apps: [
    {
      name: "rb",
      script: "./main.js",
      cron_restart: "0 0 0 * * *", // Restarts the app every day at 12:00 AM
    },
    {
      name: "scd",
      script: "./scheduler.js",
      cron_restart: "0 0 5 * * *", // Restarts the app at 5:00 AM every day
      cron_stop: "0 0 17 * * *", // Stops the app at 5:00 PM every day
    },
  ],
};