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
      cron_restart: "0 0 8-16 * * * Asia/Manila", // Runs the app from 8:00 AM to 5:00 PM every day in Asia/Manila timezone
      cron_stop: "0 0 17 * * * Asia/Manila", // Stops the app at 5:00 PM every day in Asia/Manila timezone
    },
  ],
};
