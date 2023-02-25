module.exports = {
  apps: [
    {
      name: "Process",
      script: "./main.js",
      interpreter_args: "--max-old-space-size=4096",
      cron_restart: "20 7 * * *",
    },
    {
      name: "Scheduler",
      script: "./scheduler.js",
      cron_restart: "0 0 8 * * *", // Restarts the app at 8:00 AM every day
      cron_stop: "0 0 17 * * *", // Stops the app at 5:00 PM every day
    },
  ],
};
