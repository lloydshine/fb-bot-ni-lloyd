const moment = require("moment-timezone");
const schedule = require("../schedule.json");

function sched(event,command,api) {
  const timezone = "Asia/Manila";
  let currentTime = moment().tz(timezone);

  // Get current day of the week
  const day = command ? command : currentTime.format("dddd");
  const currentHour = currentTime.format("h:mmA");
  // Get courses for the current day
  const subjects = schedule[day];
  if(!subjects) {
    api.sendMessage("Huh?", "3895005423936924", event.messageID);
    return;
  }
  let message = `Time:${currentHour}\nSchedule for ${day}:\n`;
  subjects.forEach((course, index) => {
    message += `[${index + 1}] ${course.code} ${course.start_time}-${
      course.end_time
    }\n`;
  });
  api.sendMessage(message, "3895005423936924", event.messageID);
}

module.exports = sched;