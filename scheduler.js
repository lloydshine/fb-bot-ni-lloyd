const fs = require("fs");
const login = require("fca-unofficial");
const moment = require("moment-timezone");
const schedule = require("./schedule.json");

login(
  { appState: JSON.parse(fs.readFileSync("appstate1.json", "utf8")) },
  async (err, api) => {
    if (err) return console.error(err);
    const timezone = "Asia/Manila";
    const currentTime = moment().tz(timezone);

    // Get current day of the week
    const currentDay = currentTime.format("dddd");

    // Get courses for the current day
    const subjects = schedule[currentDay];

    subjects.forEach((course) => {
      // Perform some action on the course object, e.g.:
      console.log(course.course);
      const reminderDateTime = moment.tz(
        `${course.start_time}`,
        "h:mmA",
        timezone
      );

      // Calculate the duration until the reminder
      const duration = moment.duration(reminderDateTime.diff(currentTime));
      const minutesBeforeReminder = 10; // Change this to set the number of minutes before the reminder time to send the initial notification

      if (duration.asMilliseconds() < 0) {
        console.log(
          `${course.code} is already done! ${course.start_time} - ${course.end_time}`
        );
        return;
      }
      const initialDuration =
        duration.asMilliseconds() - minutesBeforeReminder * 60 * 1000;
      setTimeout(() => {
        api.sendMessage(
          `${course.course} will start in ${minutesBeforeReminder} minutes.`,
          "3895005423936924"
        );
      }, initialDuration);

      // Schedule the reminder
      setTimeout(() => {
        // Write the updated reminders object back to the file
        api.sendMessage(`${course.code} will start now!`, "3895005423936924");
      }, duration.asMilliseconds());
    });

    const listenEmitter = api.listen(async (err, event) => {
      if (event.threadID != "3895005423936924") {
        return;
      }
      if (err) return console.error(err);
      switch (event.type) {
        case "message":
          if(!event.body.includes("sched")) {
            return;
          }
          let message = `Today is ${currentDay}, Schedules:\n`
          subjects.forEach((course,index) => {
            message += `[${index+1}] ${course.code} ${course.start_time} - ${course.end_time}\n`;
          })
          api.sendMessage(message, "3895005423936924",event.messageID);
          break;
        default:
          break;
      }
    });
  }
);
