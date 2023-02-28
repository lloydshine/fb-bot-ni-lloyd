const moment = require("moment-timezone");
const schedule = require("../schedule.json");

function sched(event,api) {
  const timezone = "Asia/Manila";
  let currentTime = moment().tz(timezone);

  // Get current day of the week
  const currentDay = currentTime.format("dddd");
  const currentHour = currentTime.format("h:mmA");
  // Get courses for the current day
  const subjects = schedule[currentDay];
  let message = `Today is:\n${currentDay},${currentHour}\nSchedule:\n`;
  subjects.forEach((course, index) => {
    message += `[${index + 1}] ${course.code} ${course.start_time} - ${
      course.end_time
    }\n`;
  });
  api.sendMessage(message, "3895005423936924", event.messageID);
}

module.exports = sched;