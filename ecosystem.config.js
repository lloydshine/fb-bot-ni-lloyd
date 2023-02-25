module.exports = {
  apps: [
    {
      name: "Process",
      script: "./main.js",
    },
    {
      name: "Scheduler",
      script: "./scheduler.js",
      cron_restart: "0 0 8 * * * Asia/Manila", // Restarts the app at 8:00 AM every day
      cron_stop: "0 0 17 * * * Asia/Manila", // Stops the app at 5:00 PM every day
    },
  ],
};