module.exports = {
  apps: [
    {
      name: "Process",
      script: "./main.js",
      args: "--max-old-space-size=4096",
    },
    {
      name: "Scheduler",
      script: "./scheduler.js",
      cron_restart: "0 8-16 * * *", // Runs the app from 8:00 AM to 5:00 PM every day
      cron_stop: "0 17 * * *", // Stops the app at 5:00 PM every day
    },
  ],
};
