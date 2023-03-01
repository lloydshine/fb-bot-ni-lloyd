const fs = require("fs");
const login = require("fca-unofficial");
const moment = require("moment-timezone");
const schedule = require("./schedule.json");
const pm2 = require('pm2');

login(
  { appState: JSON.parse(fs.readFileSync("appstate1.json", "utf8")) },
  async (err, api) => {
    api.setOptions({ listenEvents: true, forceLogin: true });
    if (err) return console.error(err);
    console.log("ON");
    api.sendMessage("I am on!", "100008672340619");
    const timezone = "Asia/Manila";
    let currentTime = moment().tz(timezone);

    // Get current day of the week
    const currentDay = currentTime.format("dddd");
    console.log(`Time: ${currentTime} , Day: ${currentDay}`);

    // Get courses for the current day
    const subjects = schedule[currentDay];

    let courseIndex = 0;
    while (courseIndex < subjects.length) {
      const course = subjects[courseIndex];
      currentTime = moment().tz(timezone);
      console.log(course.course);
      const reminderDateTime = moment.tz(course.start_time, "h:mmA", timezone);

      // Calculate the duration until the start time
      const duration = moment.duration(reminderDateTime.diff(currentTime));
      console.log(`Duration Minutes: ${duration.asMinutes().toFixed(0)}`);
      const minutesBeforeReminder = 10; // Change this to set the number of minutes before the reminder time to send the initial notification

      if (duration.asMilliseconds() < 0) {
        console.log(
          `${course.code} is already done! ${course.start_time} - ${course.end_time}`
        );
        courseIndex++;
        continue;
      }
      const initialDuration =
        duration.asMilliseconds() - minutesBeforeReminder * 60 * 1000;
      setTimeout(() => {
        api.sendMessage(
          `${course.course} will start in ${minutesBeforeReminder} minutes.`,
          "3895005423936924"
        );
      }, initialDuration);

      // Wait until the start time of the course
      await new Promise((resolve) => setTimeout(resolve, duration.asMilliseconds()));

      // Send a notification for the start of the course
      for (let x = 0; x < 3; x++) {
        api.sendMessage(
          `${course.code} will start now! (${course.start_time})\nAnd will end in ${course.end_time}`,
          "3895005423936924"
        );
      }

      courseIndex++;
    }

    // Stop the application
    pm2.stop(process.env.pm_id, (err, proc) => {
      if (err) {
        console.error('Error stopping application:', err);
      } else {
        api.sendMessage(
          `My job here is done! See you Tommorow!`,
          "3895005423936924"
        );
        console.log('Application stopped successfully:', proc);
      }
    });
  }
);
